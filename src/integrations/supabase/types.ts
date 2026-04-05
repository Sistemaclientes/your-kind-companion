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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
          cpf: string | null
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
          slug: string | null
          status: string | null
          telefone: string | null
          token_expires_at: string | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          confirmation_token?: string | null
          cpf?: string | null
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
          slug?: string | null
          status?: string | null
          telefone?: string | null
          token_expires_at?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          confirmation_token?: string | null
          cpf?: string | null
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
          slug?: string | null
          status?: string | null
          telefone?: string | null
          token_expires_at?: string | null
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
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "vw_turmas_performance"
            referencedColumns: ["turma_id"]
          },
        ]
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
      dicas_sistema: {
        Row: {
          ativa: boolean | null
          conteudo: string
          created_at: string
          id: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          ativa?: boolean | null
          conteudo: string
          created_at?: string
          id?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          ativa?: boolean | null
          conteudo?: string
          created_at?: string
          id?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      logs_atividade: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          ip_address: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_role?: string | null
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
            referencedColumns: ["prova_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_master: boolean | null
          is_protected: boolean | null
          nome: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_master?: boolean | null
          is_protected?: boolean | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_master?: boolean | null
          is_protected?: boolean | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
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
          subtitulo: string | null
          tags: string[] | null
          tentativas_maximas: number | null
          titulo: string
          total_pontos: number | null
          total_questoes: number | null
          turma_id: string | null
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
          subtitulo?: string | null
          tags?: string[] | null
          tentativas_maximas?: number | null
          titulo: string
          total_pontos?: number | null
          total_questoes?: number | null
          turma_id?: string | null
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
          subtitulo?: string | null
          tags?: string[] | null
          tentativas_maximas?: number | null
          titulo?: string
          total_pontos?: number | null
          total_questoes?: number | null
          turma_id?: string | null
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
          {
            foreignKeyName: "provas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "vw_turmas_performance"
            referencedColumns: ["turma_id"]
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
          resposta_texto: string | null
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
          resposta_texto?: string | null
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
          resposta_texto?: string | null
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
            foreignKeyName: "respostas_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_stats"
            referencedColumns: ["aluno_id"]
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
            referencedColumns: ["prova_id"]
          },
          {
            foreignKeyName: "respostas_aluno_resultado_id_fkey"
            columns: ["resultado_id"]
            isOneToOne: false
            referencedRelation: "resultados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_aluno_resultado_id_fkey"
            columns: ["resultado_id"]
            isOneToOne: false
            referencedRelation: "vw_ranking_alunos"
            referencedColumns: ["resultado_id"]
          },
        ]
      }
      resultados: {
        Row: {
          acertos: number | null
          aluno_id: string
          created_at: string
          data: string | null
          data_conclusao: string | null
          duracao_segundos: number | null
          email_aluno: string | null
          finalizado_em: string | null
          id: string
          navegador_info: string | null
          nome_aluno: string | null
          nota_corte: number | null
          pontos_obtidos: number | null
          pontos_total: number | null
          pontuacao: number | null
          prova_id: string
          respostas: Json | null
          slug: string | null
          status: string | null
          tentativa_numero: number | null
          total: number | null
          total_questoes: number | null
          total_time: number | null
          updated_at: string | null
        }
        Insert: {
          acertos?: number | null
          aluno_id: string
          created_at?: string
          data?: string | null
          data_conclusao?: string | null
          duracao_segundos?: number | null
          email_aluno?: string | null
          finalizado_em?: string | null
          id?: string
          navegador_info?: string | null
          nome_aluno?: string | null
          nota_corte?: number | null
          pontos_obtidos?: number | null
          pontos_total?: number | null
          pontuacao?: number | null
          prova_id: string
          respostas?: Json | null
          slug?: string | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          total_questoes?: number | null
          total_time?: number | null
          updated_at?: string | null
        }
        Update: {
          acertos?: number | null
          aluno_id?: string
          created_at?: string
          data?: string | null
          data_conclusao?: string | null
          duracao_segundos?: number | null
          email_aluno?: string | null
          finalizado_em?: string | null
          id?: string
          navegador_info?: string | null
          nome_aluno?: string | null
          nota_corte?: number | null
          pontos_obtidos?: number | null
          pontos_total?: number | null
          pontuacao?: number | null
          prova_id?: string
          respostas?: Json | null
          slug?: string | null
          status?: string | null
          tentativa_numero?: number | null
          total?: number | null
          total_questoes?: number | null
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
            foreignKeyName: "resultados_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_stats"
            referencedColumns: ["aluno_id"]
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
            referencedColumns: ["prova_id"]
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          professor_id: string | null
          slug: string
          total_alunos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          professor_id?: string | null
          slug: string
          total_alunos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          professor_id?: string | null
          slug?: string
          total_alunos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_alunos_stats: {
        Row: {
          aluno_id: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          media_pontuacao: number | null
          nome: string | null
          primeiro_acesso: string | null
          provas_contagem: number | null
          slug: string | null
          status: string | null
          telefone: string | null
          turma_id: string | null
          turma_nome: string | null
          ultimo_acesso: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "vw_turmas_performance"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      vw_dashboard_stats: {
        Row: {
          media_geral: number | null
          total_alunos: number | null
          total_provas: number | null
          total_resultados: number | null
        }
        Relationships: []
      }
      vw_provas_stats: {
        Row: {
          alunos_unicos: number | null
          media_pontuacao: number | null
          nota_maxima: number | null
          nota_minima: number | null
          prova_id: string | null
          status: string | null
          titulo: string | null
          total_conclusoes: number | null
        }
        Relationships: []
      }
      vw_ranking_alunos: {
        Row: {
          acertos: number | null
          aluno_avatar: string | null
          aluno_email: string | null
          aluno_id: string | null
          aluno_nome: string | null
          data_conclusao: string | null
          pontuacao: number | null
          posicao: number | null
          prova_id: string | null
          prova_titulo: string | null
          resultado_id: string | null
          resultado_slug: string | null
          total: number | null
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
            foreignKeyName: "resultados_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_stats"
            referencedColumns: ["aluno_id"]
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
            referencedColumns: ["prova_id"]
          },
        ]
      }
      vw_turmas_performance: {
        Row: {
          media_turma: number | null
          total_alunos: number | null
          total_provas_concluidas: number | null
          turma_id: string | null
          turma_nome: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      generate_slug: { Args: { title: string }; Returns: string }
      get_my_role: { Args: never; Returns: string }
      login_aluno: { Args: { p_email: string; p_senha: string }; Returns: Json }
    }
    Enums: {
      user_role: "admin" | "aluno"
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
      user_role: ["admin", "aluno"],
    },
  },
} as const
