import { calcularProgressoAluno, type AlunoProgressStats } from '@/lib/alunoProgress'
import { supabase } from '@/lib/supabase'

export async function fetchAlunoProgress(userId: string): Promise<AlunoProgressStats> {
  const { data, error } = await supabase
    .from('leituras')
    .select('status_leitura')
    .eq('usuario_id', userId)

  if (error) throw error
  return calcularProgressoAluno(data ?? [])
}
