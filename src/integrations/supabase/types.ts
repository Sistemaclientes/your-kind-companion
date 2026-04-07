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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_master: boolean | null
          nome: string | null
          reset_token: string | null
          reset_token_expires_at: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          is_master?: boolean | null
          nome?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_master?: boolean | null
          nome?: string | null
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
          biografia: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string | null
          reset_token: string | null
          reset_token_expires_at: string | null
          status: string | null
          telefone: string | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          biografia?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id: string
          nome?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          status?: string | null
          telefone?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          biografia?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          reset_token?: string | null
          reset_token_expires_at?: string | null
          status?: string | null
          telefone?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
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
          cor_primaria: string | null
          created_at: string | null
          exibir_resultado_imediatamente: boolean | null
          favicon_url: string | null
          fb_api_token: string | null
          fb_pixel_id: string | null
          google_tag_id: string | null
          id: string
          liberar_revisao: boolean | null
          logo_url: string | null
          mensagem_resultado: string | null
          nome_empresa: string | null
          nota_minima: number | null
          permitir_refazer: boolean | null
          primary_color: string | null
          privacidade_url: string | null
          success_color: string | null
          suporte_email: string | null
          suporte_whatsapp: string | null
          termos_uso_url: string | null
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          cor_primaria?: string | null
          created_at?: string | null
          exibir_resultado_imediatamente?: boolean | null
          favicon_url?: string | null
          fb_api_token?: string | null
          fb_pixel_id?: string | null
          google_tag_id?: string | null
          id?: string
          liberar_revisao?: boolean | null
          logo_url?: string | null
          mensagem_resultado?: string | null
          nome_empresa?: string | null
          nota_minima?: number | null
          permitir_refazer?: boolean | null
          primary_color?: string | null
          privacidade_url?: string | null
          success_color?: string | null
          suporte_email?: string | null
          suporte_whatsapp?: string | null
          termos_uso_url?: string | null
          updated_at?: string | null
          valor?: Json
        }
        Update: {
          chave?: string
          cor_primaria?: string | null
          created_at?: string | null
          exibir_resultado_imediatamente?: boolean | null
          favicon_url?: string | null
          fb_api_token?: string | null
          fb_pixel_id?: string | null
          google_tag_id?: string | null
          id?: string
          liberar_revisao?: boolean | null
          logo_url?: string | null
          mensagem_resultado?: string | null
          nome_empresa?: string | null
          nota_minima?: number | null
          permitir_refazer?: boolean | null
          primary_color?: string | null
          privacidade_url?: string | null
          success_color?: string | null
          suporte_email?: string | null
          suporte_whatsapp?: string | null
          termos_uso_url?: string | null
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
          explicacao: string | null
          id: string
          imagem_url: string | null
          ordem: number | null
          pergunta: string | null
          pontos: number | null
          prova_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          pergunta?: string | null
          pontos?: number | null
          prova_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          pergunta?: string | null
          pontos?: number | null
          prova_id?: string | null
          tipo?: string | null
          updated_at?: string | null
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
          bloquear_navegacao: boolean | null
          categoria_id: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          duracao: number | null
          embaralhar_questoes: boolean | null
          id: string
          mostrar_resultado: boolean | null
          nota_corte: number | null
          permitir_revisao: boolean | null
          slug: string | null
          status: string | null
          subtitulo: string | null
          tentativas_permitidas: number | null
          titulo: string | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          bloquear_navegacao?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          duracao?: number | null
          embaralhar_questoes?: boolean | null
          id?: string
          mostrar_resultado?: boolean | null
          nota_corte?: number | null
          permitir_revisao?: boolean | null
          slug?: string | null
          status?: string | null
          subtitulo?: string | null
          tentativas_permitidas?: number | null
          titulo?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bloquear_navegacao?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          duracao?: number | null
          embaralhar_questoes?: boolean | null
          id?: string
          mostrar_resultado?: boolean | null
          nota_corte?: number | null
          permitir_revisao?: boolean | null
          slug?: string | null
          status?: string | null
          subtitulo?: string | null
          tentativas_permitidas?: number | null
          titulo?: string | null
          turma_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "provas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          correta: boolean | null
          id: string
          ordem: number | null
          pergunta_id: string | null
          texto: string | null
          updated_at: string | null
        }
        Insert: {
          correta?: boolean | null
          id?: string
          ordem?: number | null
          pergunta_id?: string | null
          texto?: string | null
          updated_at?: string | null
        }
        Update: {
          correta?: boolean | null
          id?: string
          ordem?: number | null
          pergunta_id?: string | null
          texto?: string | null
          updated_at?: string | null
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
      respostas_aluno: {
        Row: {
          comentario_professor: string | null
          created_at: string | null
          id: string
          is_correta: boolean | null
          pergunta_id: string | null
          pontuacao_atribuida: number | null
          resposta_id: string | null
          resultado_id: string | null
          status: string | null
          texto_resposta: string | null
          updated_at: string | null
        }
        Insert: {
          comentario_professor?: string | null
          created_at?: string | null
          id?: string
          is_correta?: boolean | null
          pergunta_id?: string | null
          pontuacao_atribuida?: number | null
          resposta_id?: string | null
          resultado_id?: string | null
          status?: string | null
          texto_resposta?: string | null
          updated_at?: string | null
        }
        Update: {
          comentario_professor?: string | null
          created_at?: string | null
          id?: string
          is_correta?: boolean | null
          pergunta_id?: string | null
          pontuacao_atribuida?: number | null
          resposta_id?: string | null
          resultado_id?: string | null
          status?: string | null
          texto_resposta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_aluno_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "respostas"
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
          aluno_id: string | null
          concluido_em: string | null
          created_at: string | null
          duracao_total: number | null
          id: string
          iniciado_em: string | null
          nota_corte_alvo: number | null
          pontuacao: number | null
          prova_id: string | null
          respostas: Json | null
          status: string | null
          tentativa_numero: number | null
          total: number | null
          turma_id: string | null
        }
        Insert: {
          acertos?: number | null
          aluno_id?: string | null
          concluido_em?: string | null
          created_at?: string | null
          duracao_total?: number | null
          id?: string
          iniciado_em?: string | null
          nota_corte_alvo?: number | null
          pontuacao?: number | null
          prova_id?: string | null
          respostas?: Json | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          turma_id?: string | null
        }
        Update: {
          acertos?: number | null
          aluno_id?: string | null
          concluido_em?: string | null
          created_at?: string | null
          duracao_total?: number | null
          id?: string
          iniciado_em?: string | null
          nota_corte_alvo?: number | null
          pontuacao?: number | null
          prova_id?: string | null
          respostas?: Json | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          turma_id?: string | null
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
            foreignKeyName: "resultados_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
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
      slugify: { Args: { v_text: string }; Returns: string }
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
