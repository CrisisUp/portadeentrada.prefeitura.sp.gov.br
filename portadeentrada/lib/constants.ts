import { StatusPrograma, StatusInscricao } from '@/types'

export const CATEGORIAS = [
  'Fomento',
  'Festival',
  'Cursos',
  'Editais Abertos',
  'Eventos',
  'Editais',
  'Educação',
] as const

export const STATUS_OPTIONS: { value: StatusPrograma; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'encerrado', label: 'Encerrado' },
]

export const STATUS_COLORS: Record<StatusPrograma, string> = {
  aberto: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  encerrado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const STATUS_LABELS: Record<StatusPrograma, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  encerrado: 'Encerrado',
}

// Status de Inscrição
export const STATUS_INSCRICAO_OPTIONS: { value: StatusInscricao; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'rejeitada', label: 'Rejeitada' },
]

export const STATUS_INSCRICAO_COLORS: Record<StatusInscricao, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  aprovada: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
}

export const STATUS_INSCRICAO_LABELS: Record<StatusInscricao, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
}

// Roles de Usuário
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  EDITOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}
