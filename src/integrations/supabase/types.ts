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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      chat_members: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_texts: {
        Row: {
          body: string
          chat_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          chat_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          chat_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_texts_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          created_at: string
          id: string
          message: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "coach_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      form_checks: {
        Row: {
          created_at: string
          cues: Json
          exercise_id: string | null
          exercise_name: string
          feedback: string | null
          id: string
          score: number | null
          user_id: string
          verdict: string | null
          video_path: string | null
        }
        Insert: {
          created_at?: string
          cues?: Json
          exercise_id?: string | null
          exercise_name: string
          feedback?: string | null
          id?: string
          score?: number | null
          user_id: string
          verdict?: string | null
          video_path?: string | null
        }
        Update: {
          created_at?: string
          cues?: Json
          exercise_id?: string | null
          exercise_name?: string
          feedback?: string | null
          id?: string
          score?: number | null
          user_id?: string
          verdict?: string | null
          video_path?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_id: string
          exercise_name: string
          id: string
          kind: string
          reps: number | null
          user_id: string
          value: number
          weight: number | null
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          exercise_id: string
          exercise_name: string
          id?: string
          kind: string
          reps?: number | null
          user_id: string
          value: number
          weight?: number | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          id?: string
          kind?: string
          reps?: number | null
          user_id?: string
          value?: number
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          body_weight: number | null
          club_team: string | null
          created_at: string
          display_name: string
          grad_year: number | null
          id: string
          onboarded: boolean
          school: string | null
          sport: string | null
          tracks: string[]
          unit: string
          updated_at: string
        }
        Insert: {
          body_weight?: number | null
          club_team?: string | null
          created_at?: string
          display_name?: string
          grad_year?: number | null
          id: string
          onboarded?: boolean
          school?: string | null
          sport?: string | null
          tracks?: string[]
          unit?: string
          updated_at?: string
        }
        Update: {
          body_weight?: number | null
          club_team?: string | null
          created_at?: string
          display_name?: string
          grad_year?: number | null
          id?: string
          onboarded?: boolean
          school?: string | null
          sport?: string | null
          tracks?: string[]
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          exercises: Json
          id: string
          name: string
          program_id: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name: string
          program_id?: string | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name?: string
          program_id?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          completed_at: string | null
          created_at: string
          day_label: string | null
          exercises: Json
          focus: string | null
          id: string
          name: string
          program_id: string | null
          scheduled_for: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_label?: string | null
          exercises?: Json
          focus?: string | null
          id?: string
          name: string
          program_id?: string | null
          scheduled_for: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_label?: string | null
          exercises?: Json
          focus?: string | null
          id?: string
          name?: string
          program_id?: string | null
          scheduled_for?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_hypes: {
        Row: {
          created_at: string
          emoji: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_hypes_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration_sec: number
          exercises: Json
          finished_at: string
          id: string
          name: string
          notes: string | null
          started_at: string
          total_sets: number
          total_volume: number
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_sec?: number
          exercises?: Json
          finished_at?: string
          id?: string
          name?: string
          notes?: string | null
          started_at?: string
          total_sets?: number
          total_volume?: number
          user_id: string
        }
        Update: {
          created_at?: string
          duration_sec?: number
          exercises?: Json
          finished_at?: string
          id?: string
          name?: string
          notes?: string | null
          started_at?: string
          total_sets?: number
          total_volume?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      chat_participants: {
        Args: { _chat_id: string }
        Returns: {
          display_name: string
          id: string
        }[]
      }
      friend_activity_feed: {
        Args: { limit_count?: number }
        Returns: {
          athlete_id: string
          display_name: string
          duration_sec: number
          hypes: Json
          name: string
          school: string
          sport: string
          started_at: string
          total_sets: number
          total_volume: number
          workout_id: string
        }[]
      }
      friend_profiles: {
        Args: { ids: string[] }
        Returns: {
          display_name: string
          id: string
          sport: string
        }[]
      }
      friends_leaderboard: {
        Args: never
        Returns: {
          club_team: string
          display_name: string
          grad_year: number
          id: string
          last_workout: string
          school: string
          sport: string
          total_volume: number
          workout_count: number
        }[]
      }
      get_or_create_dm: { Args: { _other: string }; Returns: string }
      is_chat_member: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      search_athletes: {
        Args: { q: string }
        Returns: {
          display_name: string
          id: string
          sport: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
