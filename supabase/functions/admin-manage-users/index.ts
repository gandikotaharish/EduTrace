import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Verify the caller is an admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "create_user": {
        const { email, password, full_name, role } = params;
        if (!email || !password || !full_name || !role) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create user via admin API
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role },
        });

        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const uid = newUser.user.id;
        const r = role === "admin" || role === "teacher" || role === "student" ? role : "student";
        await adminClient.from("profiles").upsert({ user_id: uid, full_name: full_name || newUser.user.email?.split("@")[0] || "User" }, { onConflict: "user_id" });
        const { data: existingRole } = await adminClient.from("user_roles").select("id").eq("user_id", uid).maybeSingle();
        if (!existingRole) {
          await adminClient.from("user_roles").insert({ user_id: uid, role: r });
        }

        return new Response(JSON.stringify({ user: newUser.user }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { user_id, new_password } = params;
        if (!user_id || !new_password) {
          return new Response(JSON.stringify({ error: "Missing user_id or new_password" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: updateError } = await adminClient.auth.admin.updateUserById(user_id, {
          password: new_password,
        });

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle_active": {
        const { user_id, is_active } = params;
        if (!user_id || is_active === undefined) {
          return new Response(JSON.stringify({ error: "Missing user_id or is_active" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update profile is_active
        const { error: profileError } = await adminClient
          .from("profiles")
          .update({ is_active })
          .eq("user_id", user_id);

        if (profileError) {
          return new Response(JSON.stringify({ error: profileError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // If deactivating, also ban the user in auth
        if (!is_active) {
          await adminClient.auth.admin.updateUserById(user_id, {
            ban_duration: "876000h", // ~100 years
          });
        } else {
          await adminClient.auth.admin.updateUserById(user_id, {
            ban_duration: "none",
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list_users": {
        // Get all users with their auth data
        const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers({
          perPage: 1000,
        });

        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ users: authUsers.users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
