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

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { action, class_id, school_id, students } = await req.json();

    if (action === "create_students" && class_id && school_id && Array.isArray(students)) {
      const { data: cta } = await adminClient
        .from("class_teacher_assignments")
        .select("teacher_id")
        .eq("class_id", class_id)
        .eq("teacher_id", caller.id)
        .maybeSingle();

      const { data: adminRole } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!cta && !adminRole) {
        return new Response(JSON.stringify({ error: "Forbidden: Only class teacher or admin can create students for this class" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const created: { email: string; password: string; full_name: string; user_id?: string }[] = [];
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < students.length; i++) {
        const row = students[i];
        const email = (row.email || row.username || "").toString().trim();
        const full_name = (row.full_name || row.name || email.split("@")[0] || "Student").toString().trim();
        const password = (row.password || row.temp_password || generateTempPassword()).toString();

        if (!email) {
          errors.push({ row: i + 1, message: "Missing email" });
          continue;
        }

        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role: "student" },
        });

        if (createError) {
          errors.push({ row: i + 1, message: createError.message });
          continue;
        }

        const uid = newUser!.user!.id;
        await adminClient.from("profiles").upsert(
          {
            user_id: uid,
            full_name,
            force_password_reset: true,
          },
          { onConflict: "user_id" }
        );
        const { data: existingRole } = await adminClient.from("user_roles").select("id").eq("user_id", uid).maybeSingle();
        if (!existingRole) {
          await adminClient.from("user_roles").insert({ user_id: uid, role: "student" });
        }
        await adminClient.from("student_assignments").insert({
          student_id: uid,
          school_id: school_id,
          class_id: class_id,
        });

        created.push({ email, password, full_name, user_id: uid });
      }

      if (created.length > 0) {
        await adminClient.from("credential_batches").insert({
          class_id,
          teacher_id: caller.id,
          student_count: created.length,
        });
      }

      return new Response(
        JSON.stringify({ created, errors }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + "!1";
}
