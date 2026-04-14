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
      benefits: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          exclusive: boolean | null
          expires_at: string | null
          id: string
          offer: string
          updated_at: string | null
          user_id: string
          whatsapp: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          exclusive?: boolean | null
          expires_at?: string | null
          id?: string
          offer: string
          updated_at?: string | null
          user_id: string
          whatsapp?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          exclusive?: boolean | null
          expires_at?: string | null
          id?: string
          offer?: string
          updated_at?: string | null
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          course_id: string
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          certificate_code?: string
          course_id: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          certificate_code?: string
          course_id?: string
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_preview: boolean | null
          materials: Json | null
          module_id: string
          sort_order: number
          title: string
          updated_at: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          materials?: Json | null
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          materials?: Json | null
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          instructor_name: string | null
          level: string
          premium: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          instructor_name?: string | null
          level?: string
          premium?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          instructor_name?: string | null
          level?: string
          premium?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          registration_data: Json | null
          status: string | null
          ticket_code: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          registration_data?: Json | null
          status?: string | null
          ticket_code: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          registration_data?: Json | null
          status?: string | null
          ticket_code?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          active: boolean | null
          address: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_free: boolean | null
          location: string | null
          max_attendees: number | null
          online_url: string | null
          price: number | null
          registration_fields: Json | null
          short_description: string | null
          start_date: string
          state: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          online_url?: string | null
          price?: number | null
          registration_fields?: Json | null
          short_description?: string | null
          start_date: string
          state?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          location?: string | null
          max_attendees?: number | null
          online_url?: string | null
          price?: number | null
          registration_fields?: Json | null
          short_description?: string | null
          start_date?: string
          state?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_path_courses: {
        Row: {
          course_id: string
          id: string
          learning_path_id: string
          sort_order: number
        }
        Insert: {
          course_id: string
          id?: string
          learning_path_id: string
          sort_order?: number
        }
        Update: {
          course_id?: string
          id?: string
          learning_path_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          progress_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          active: boolean | null
          closed_at: string | null
          closed_with: string | null
          created_at: string | null
          deal_feedback: string | null
          deal_value: number | null
          description: string | null
          id: string
          interested_count: number
          status: string
          title: string
          type: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string
          value: string | null
        }
        Insert: {
          active?: boolean | null
          closed_at?: string | null
          closed_with?: string | null
          created_at?: string | null
          deal_feedback?: string | null
          deal_value?: number | null
          description?: string | null
          id?: string
          interested_count?: number
          status?: string
          title: string
          type?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id: string
          value?: string | null
        }
        Update: {
          active?: boolean | null
          closed_at?: string | null
          closed_with?: string | null
          created_at?: string | null
          deal_feedback?: string | null
          deal_value?: number | null
          description?: string | null
          id?: string
          interested_count?: number
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          price: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          price?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          price?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          approved: boolean
          city: string
          cnpj: string
          company_name: string
          complement: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          contact_role: string
          created_at: string
          description: string | null
          email: string
          id: string
          logo_url: string | null
          neighborhood: string | null
          phone: string
          plan: string
          reference_point: string | null
          segment: string
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          approved?: boolean
          city?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contact_role?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          neighborhood?: string | null
          phone?: string
          plan?: string
          reference_point?: string | null
          segment?: string
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          approved?: boolean
          city?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contact_role?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          neighborhood?: string | null
          phone?: string
          plan?: string
          reference_point?: string | null
          segment?: string
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_percent: number
          expires_at: string
          id: string
          image_url: string | null
          original_price: number | null
          promo_price: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          expires_at: string
          id?: string
          image_url?: string | null
          original_price?: number | null
          promo_price?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          expires_at?: string
          id?: string
          image_url?: string | null
          original_price?: number | null
          promo_price?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          benefit_id: string
          code: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          benefit_id: string
          code: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          benefit_id?: string
          code?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          id: string
          segment: string
          whatsapp: string
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          id?: string
          segment?: string
          whatsapp: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          id?: string
          segment?: string
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
