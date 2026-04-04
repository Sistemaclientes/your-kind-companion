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
          active: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          email_confirmed: boolean | null
          id: string
          is_master: boolean | null
          is_protected: boolean | null
          last_login: string | null
          must_reconfirm: boolean | null
          nome: string
          reset_expires: string | null
          reset_token: string | null
          senha: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_confirmed?: boolean | null
          id?: string
          is_master?: boolean | null
          is_protected?: boolean | null
          last_login?: string | null
          must_reconfirm?: boolean | null
          nome: string
          reset_expires?: string | null
          reset_token?: string | null
          senha: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_confirmed?: boolean | null
          id?: string
          is_master?: boolean | null
          is_protected?: boolean | null
          last_login?: string | null
          must_reconfirm?: boolean | null
          nome?: string
          reset_expires?: string | null
          reset_token?: string | null
          senha?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alternativas: {
        Row: {
          created_at: string | null
          explicacao: string | null
          id: string
          is_correta: boolean | null
          ordem: number | null
          pergunta_id: string
          texto: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          explicacao?: string | null
          id?: string
          is_correta?: boolean | null
          ordem?: number | null
          pergunta_id: string
          texto: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          explicacao?: string | null
          id?: string
          is_correta?: boolean | null
          ordem?: number | null
          pergunta_id?: string
          texto?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alternativas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          avatar_url: string | null
          confirmation_token: string | null
          created_at: string | null
          email: string
          email_confirmed: boolean | null
          id: string
          last_login: string | null
          must_reconfirm: boolean | null
          nome: string
          reset_expires: string | null
          reset_token: string | null
          senha: string | null
          status: string | null
          telefone: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email: string
          email_confirmed?: boolean | null
          id?: string
          last_login?: string | null
          must_reconfirm?: boolean | null
          nome: string
          reset_expires?: string | null
          reset_token?: string | null
          senha?: string | null
          status?: string | null
          telefone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email?: string
          email_confirmed?: boolean | null
          id?: string
          last_login?: string | null
          must_reconfirm?: boolean | null
          nome?: string
          reset_expires?: string | null
          reset_token?: string | null
          senha?: string | null
          status?: string | null
          telefone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          icon: string | null
          id: string
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icon?: string | null
          id?: string
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icon?: string | null
          id?: string
          nome?: string
          slug?: string
          updated_at?: string
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
          valor: Json
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
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      perguntas: {
        Row: {
          categoria_id: string | null
          dificuldade: string | null
          enunciado: string
          explicacao: string | null
          id: string
          imagem_url: string | null
          ordem: number | null
          pontos: number | null
          prova_id: string
          status: string | null
          tags: string[] | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          categoria_id?: string | null
          dificuldade?: string | null
          enunciado: string
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          pontos?: number | null
          prova_id: string
          status?: string | null
          tags?: string[] | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria_id?: string | null
          dificuldade?: string | null
          enunciado?: string
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          pontos?: number | null
          prova_id?: string
          status?: string | null
          tags?: string[] | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perguntas_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perguntas_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "vw_provas_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          nome: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provas: {
        Row: {
          banner_url: string | null
          bloquear_navegacao: boolean | null
          categoria_id: string | null
          created_at: string | null
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          dificuldade: string | null
          duracao: number | null
          embaralhar_alternativas: boolean | null
          embaralhar_questoes: boolean | null
          feedback_aprovacao: string | null
          feedback_reprovacao: string | null
          id: string
          mostrar_gabarito_pos_prova: boolean | null
          mostrar_resultado: boolean | null
          nota_corte: number | null
          permite_retroceder: boolean | null
          permitir_revisao: boolean | null
          slug: string | null
          status: string | null
          tags: string[] | null
          tentativas_maximas: number | null
          titulo: string
          total_pontos: number | null
          total_questoes: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          banner_url?: string | null
          bloquear_navegacao?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dificuldade?: string | null
          duracao?: number | null
          embaralhar_alternativas?: boolean | null
          embaralhar_questoes?: boolean | null
          feedback_aprovacao?: string | null
          feedback_reprovacao?: string | null
          id?: string
          mostrar_gabarito_pos_prova?: boolean | null
          mostrar_resultado?: boolean | null
          nota_corte?: number | null
          permite_retroceder?: boolean | null
          permitir_revisao?: boolean | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          tentativas_maximas?: number | null
          titulo: string
          total_pontos?: number | null
          total_questoes?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          banner_url?: string | null
          bloquear_navegacao?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dificuldade?: string | null
          duracao?: number | null
          embaralhar_alternativas?: boolean | null
          embaralhar_questoes?: boolean | null
          feedback_aprovacao?: string | null
          feedback_reprovacao?: string | null
          id?: string
          mostrar_gabarito_pos_prova?: boolean | null
          mostrar_resultado?: boolean | null
          nota_corte?: number | null
          permite_retroceder?: boolean | null
          permitir_revisao?: boolean | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          tentativas_maximas?: number | null
          titulo?: string
          total_pontos?: number | null
          total_questoes?: number | null
          updated_at?: string | null
          view_count?: number | null
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
      respostas_aluno: {
        Row: {
          alternativa_id: string | null
          aluno_id: string | null
          correto: boolean
          created_at: string | null
          id: string
          pergunta_id: string
          pontos_pergunta: number | null
          prova_id: string
          resultado_id: string | null
          updated_at: string | null
        }
        Insert: {
          alternativa_id?: string | null
          aluno_id?: string | null
          correto: boolean
          created_at?: string | null
          id?: string
          pergunta_id: string
          pontos_pergunta?: number | null
          prova_id: string
          resultado_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alternativa_id?: string | null
          aluno_id?: string | null
          correto?: boolean
          created_at?: string | null
          id?: string
          pergunta_id?: string
          pontos_pergunta?: number | null
          prova_id?: string
          resultado_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_aluno_alternativa_id_fkey"
            columns: ["alternativa_id"]
            isOneToOne: false
            referencedRelation: "alternativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "vw_provas_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_resultado_id_fkey"
            columns: ["resultado_id"]
            isOneToOne: false
            referencedRelation: "resultados"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados: {
        Row: {
          acertos: number | null
          aluno_id: string
          data: string | null
          email_aluno: string | null
          finalizado_em: string | null
          id: string
          nome_aluno: string | null
          pontos_obtidos: number | null
          pontos_total: number | null
          pontuacao: number | null
          prova_id: string
          respostas: Json | null
          status: string | null
          tentativa_numero: number | null
          total: number | null
          total_time: number | null
          updated_at: string | null
        }
        Insert: {
          acertos?: number | null
          aluno_id: string
          data?: string | null
          email_aluno?: string | null
          finalizado_em?: string | null
          id?: string
          nome_aluno?: string | null
          pontos_obtidos?: number | null
          pontos_total?: number | null
          pontuacao?: number | null
          prova_id: string
          respostas?: Json | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          total_time?: number | null
          updated_at?: string | null
        }
        Update: {
          acertos?: number | null
          aluno_id?: string
          data?: string | null
          email_aluno?: string | null
          finalizado_em?: string | null
          id?: string
          nome_aluno?: string | null
          pontos_obtidos?: number | null
          pontos_total?: number | null
          pontuacao?: number | null
          prova_id?: string
          respostas?: Json | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          total_time?: number | null
          updated_at?: string | null
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
          {
            foreignKeyName: "resultados_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "vw_provas_stats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_provas_stats: {
        Row: {
          avg_score: number | null
          categoria_cor: string | null
          categoria_icon: string | null
          categoria_id: string | null
          categoria_nome: string | null
          created_at: string | null
          descricao: string | null
          dificuldade: string | null
          id: string | null
          max_score: number | null
          slug: string | null
          status: string | null
          studentcount: number | null
          tags: string[] | null
          titulo: string | null
          total_pontos: number | null
          total_questoes: number | null
          total_submissions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      get_my_role: { Args: never; Returns: string }
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
