export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      concept_content: {
        Row: {
          concept_id: string
          created_at: string
          explanation: string
          id: string
          image_url: string | null
          micro_app_context: string | null
          micro_app_prompt: string
          micro_app_rubric: string[] | null
          reflection_prompts: string[] | null
          thinking_task_context: string | null
          thinking_task_expected_insights: string[] | null
          thinking_task_prompt: string
          thinking_task_type: string
          updated_at: string
        }
        Insert: {
          concept_id: string
          created_at?: string
          explanation: string
          id?: string
          image_url?: string | null
          micro_app_context?: string | null
          micro_app_prompt: string
          micro_app_rubric?: string[] | null
          reflection_prompts?: string[] | null
          thinking_task_context?: string | null
          thinking_task_expected_insights?: string[] | null
          thinking_task_prompt: string
          thinking_task_type?: string
          updated_at?: string
        }
        Update: {
          concept_id?: string
          created_at?: string
          explanation?: string
          id?: string
          image_url?: string | null
          micro_app_context?: string | null
          micro_app_prompt?: string
          micro_app_rubric?: string[] | null
          reflection_prompts?: string[] | null
          thinking_task_context?: string | null
          thinking_task_expected_insights?: string[] | null
          thinking_task_prompt?: string
          thinking_task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_content_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: true
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_mastery: {
        Row: {
          concept_id: string
          evidence_count: number
          id: string
          last_updated: string
          mastery_level: string
          mastery_score: number
          student_id: string
          trend: string
        }
        Insert: {
          concept_id: string
          evidence_count?: number
          id?: string
          last_updated?: string
          mastery_level?: string
          mastery_score?: number
          student_id: string
          trend?: string
        }
        Update: {
          concept_id?: string
          evidence_count?: number
          id?: string
          last_updated?: string
          mastery_level?: string
          mastery_score?: number
          student_id?: string
          trend?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_mastery_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          created_at: string
          description: string
          estimated_minutes: number
          id: string
          name: string
          prerequisite_ids: string[] | null
          sort_order: number
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_minutes?: number
          id?: string
          name: string
          prerequisite_ids?: string[] | null
          sort_order?: number
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_minutes?: number
          id?: string
          name?: string
          prerequisite_ids?: string[] | null
          sort_order?: number
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concepts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      gap_insights: {
        Row: {
          concept_id: string
          description: string
          detected_at: string
          id: string
          severity: string
          student_id: string
          suggested_action: string
          type: string
        }
        Insert: {
          concept_id: string
          description: string
          detected_at?: string
          id?: string
          severity?: string
          student_id: string
          suggested_action: string
          type: string
        }
        Update: {
          concept_id?: string
          description?: string
          detected_at?: string
          id?: string
          severity?: string
          student_id?: string
          suggested_action?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gap_insights_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_evidence: {
        Row: {
          application_answer: string
          application_correctness: string
          application_time_seconds: number
          concept_id: string
          confidence_score: number
          confusion_point: string
          created_at: string
          id: string
          mistake_description: string
          student_id: string
          thinking_answer: string
          thinking_attempts: number
          thinking_correctness: string
          thinking_time_seconds: number
        }
        Insert: {
          application_answer?: string
          application_correctness?: string
          application_time_seconds?: number
          concept_id: string
          confidence_score?: number
          confusion_point?: string
          created_at?: string
          id?: string
          mistake_description?: string
          student_id: string
          thinking_answer?: string
          thinking_attempts?: number
          thinking_correctness?: string
          thinking_time_seconds?: number
        }
        Update: {
          application_answer?: string
          application_correctness?: string
          application_time_seconds?: number
          concept_id?: string
          confidence_score?: number
          confusion_point?: string
          created_at?: string
          id?: string
          mistake_description?: string
          student_id?: string
          thinking_answer?: string
          thinking_attempts?: number
          thinking_correctness?: string
          thinking_time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_evidence_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          icon_name?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_mastery: {
        Args: { p_concept_id: string; p_student_id: string }
        Returns: undefined
      }
      detect_gap_insights: {
        Args: { p_concept_id: string; p_student_id: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher", "admin"],
    },
  },
} as const
