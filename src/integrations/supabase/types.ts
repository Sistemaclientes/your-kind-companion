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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          reset_token: string | null
          reset_token_expires_at: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          reset_token?: string | null
          reset_token_expires_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          reset_token?: string | null
          reset_token_expires_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alunos: {
        Row: {
          avatar_url: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          reset_token: string | null
          reset_token_expires_at: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          created_at: string | null
          descricao: string | null
          icon: string | null
          id: string
          nome: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icon?: string | null
          id?: string
          nome: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icon?: string | null
          id?: string
          nome?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          created_at: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Update: {
          chave?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      convites_admin: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          role: string
          token: string
          usado: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          role?: string
          token?: string
          usado?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          role?: string
          token?: string
          usado?: boolean
        }
        Relationships: []
      }
      perguntas: {
        Row: {
          id: string
          pergunta: string | null
          prova_id: string | null
        }
        Insert: {
          id?: string
          pergunta?: string | null
          prova_id?: string | null
        }
        Update: {
          id?: string
          pergunta?: string | null
          prova_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
        ]
      }
      provas: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          slug: string | null
          titulo: string | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          slug?: string | null
          titulo?: string | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          slug?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          correta: boolean | null
          id: string
          pergunta_id: string | null
          texto: string | null
        }
        Insert: {
          correta?: boolean | null
          id?: string
          pergunta_id?: string | null
          texto?: string | null
        }
        Update: {
          correta?: boolean | null
          id?: string
          pergunta_id?: string | null
          texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados: {
        Row: {
          acertos: number | null
          aluno_id: string | null
          created_at: string | null
          id: string
          pontuacao: number | null
          prova_id: string | null
          respostas: Json | null
          total: number | null
        }
        Insert: {
          acertos?: number | null
          aluno_id?: string | null
          created_at?: string | null
          id?: string
          pontuacao?: number | null
          prova_id?: string | null
          respostas?: Json | null
          total?: number | null
        }
        Update: {
          acertos?: number | null
          aluno_id?: string | null
          created_at?: string | null
          id?: string
          pontuacao?: number | null
          prova_id?: string | null
          respostas?: Json | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resultados_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_convite_admin: { Args: { p_token: string }; Returns: Json }
      check_is_admin: { Args: never; Returns: boolean }
      gerar_convite_admin: {
        Args: { p_email: string; p_role?: string }
        Returns: Json
      }
      get_my_role: { Args: never; Returns: string }
      validar_convite_admin: { Args: { p_token: string }; Returns: Json }
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
