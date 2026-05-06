/** Resposta paginada de GET /publicacoes */
export interface PublicacaoPaginada {
  paginaAtual: number;
  totalDePaginas: number;
  totalDePublicacoes: number;
  publicacoes: Publicacao[];
}

/** Modelo alinhado ao backend Kotlin (Publicacao) */
export interface Publicacao {
  publicacaoId: number | null;
  empresaId: number | null;
  nomeEmpresa: string | null;
  titulo: string | null;
  descricao: string | null;
  tipoContrato: string | null;
  dtExpiracao: string | null;
  dtPublicacao: string | null;
}

/** GET /candidaturas/usuario — PublicacaoResponseDto */
export interface PublicacaoResumo {
  publicacaoId: number;
  /** Presente nas respostas atuais do backend; ausente em versões antigas da API. */
  empresaId?: number;
  titulo: string;
  descricao: string;
  tipoContrato: string;
  dtExpiracao: string;
  dtPublicacao: string;
  nomeEmpresa: string;
}

export interface UsuarioToken {
  nome: string | null;
  email: string;
  tokenJwt: string | null;
}

export interface UsuarioPerfil {
  nome: string | null;
  email: string;
  cpf: string | null;
  telefone: string | null;
  escolaridade: string | null;
  /** Data de nascimento (ISO `yyyy-MM-dd` ou array numérico do Jackson). */
  dtNascimento?: string | number[] | null;
  idade: number | null;
  estadoCivil: string | null;
  estado: string | null;
  cidade: string | null;
  biografia: string | null;
  curriculoUrl: string | null;
  /** Path relativo (ex.: `/usuarios/fotos/download/...`) ou URL absoluta */
  fotoUrl: string | null;
}

/** GET /usuarios/recomendar — VagasRecomendadasResponseDto */
export interface RecomendacaoVaga {
  id: number;
  titulo: string;
  tipoContrato: string;
  nomeEmpresa: string;
  idEmpresa: number;
}

export interface VagasRecomendadasResponse {
  recomendacoes: RecomendacaoVaga[];
  totalVagas: number;
  raioKm: number;
}

export interface ExperienciaApi {
  id: number;
  cargo: string;
  empresa: string;
  /** ISO string ou array [ano, mês, dia] conforme serialização Jackson */
  dtInicio: string | number[];
  dtFim: string | number[];
}

export interface CurriculoInfo {
  filename: string;
}

/** Resposta de POST /curriculos/analisar — wrapper com `analise` (AnaliseCurriculoDto no backend). */
export interface AnaliseCurriculo {
  resumo: string;
  pontosFortes: string[];
  pontosMelhoria: string[];
  sugestoes: string[];
}

export interface AnaliseCurriculoResponse {
  analise: AnaliseCurriculo;
}
