import type { QueryClient } from '@tanstack/react-query'

/** Invalida caches do gerenciador e da plataforma aluno após mudanças em conteúdos. */
export function invalidateConteudoCaches(queryClient: QueryClient, conteudoId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['conteudos'] })
  void queryClient.invalidateQueries({ queryKey: ['app-conteudos'] })
  void queryClient.invalidateQueries({ queryKey: ['visao-administrativa'] })

  if (conteudoId) {
    void queryClient.invalidateQueries({ queryKey: ['conteudo', conteudoId] })
    void queryClient.invalidateQueries({ queryKey: ['app-conteudo', conteudoId] })
    void queryClient.invalidateQueries({ queryKey: ['temas', conteudoId] })
    void queryClient.invalidateQueries({ queryKey: ['app-temas', conteudoId] })
    void queryClient.invalidateQueries({ queryKey: ['materiais', conteudoId] })
  }
}
