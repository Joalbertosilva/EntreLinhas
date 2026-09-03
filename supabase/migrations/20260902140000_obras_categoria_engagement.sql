-- Categoria da obra (gênero para capa conceitual) + curtidas e comentários públicos

CREATE TYPE public.categoria_obra_enum AS ENUM (
  'biografia',
  'autobiografia',
  'ficcao',
  'conto',
  'cronica',
  'poesia',
  'memorias',
  'ensaio',
  'fantasia',
  'romance',
  'misterio',
  'aventura',
  'outro'
);

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS categoria public.categoria_obra_enum NOT NULL DEFAULT 'outro',
  ADD COLUMN IF NOT EXISTS curtidas_count integer NOT NULL DEFAULT 0;

CREATE INDEX idx_obras_categoria ON public.obras (categoria)
  WHERE status = true;

-- Curtidas em obras publicadas
CREATE TABLE public.obra_curtidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT obra_curtidas_unique UNIQUE (usuario_id, obra_id)
);

CREATE INDEX idx_obra_curtidas_obra ON public.obra_curtidas(obra_id);
CREATE INDEX idx_obra_curtidas_usuario ON public.obra_curtidas(usuario_id);

CREATE OR REPLACE FUNCTION public.sync_obra_curtidas_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.obras
    SET curtidas_count = curtidas_count + 1
    WHERE id = NEW.obra_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.obras
    SET curtidas_count = GREATEST(0, curtidas_count - 1)
    WHERE id = OLD.obra_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER obra_curtidas_count_insert
  AFTER INSERT ON public.obra_curtidas
  FOR EACH ROW EXECUTE FUNCTION public.sync_obra_curtidas_count();

CREATE TRIGGER obra_curtidas_count_delete
  AFTER DELETE ON public.obra_curtidas
  FOR EACH ROW EXECUTE FUNCTION public.sync_obra_curtidas_count();

ALTER TABLE public.obra_curtidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY obra_curtidas_select ON public.obra_curtidas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY obra_curtidas_insert_aluno ON public.obra_curtidas
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.get_my_perfil() = 'aluno'
    AND EXISTS (
      SELECT 1 FROM public.obras o
      WHERE o.id = obra_id AND o.publicado = true AND o.status = true
    )
  );

CREATE POLICY obra_curtidas_delete_own ON public.obra_curtidas
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');

-- Comentários públicos em obras
CREATE TABLE public.obra_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  texto text NOT NULL CHECK (char_length(texto) >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_obra_comentarios_obra ON public.obra_comentarios(obra_id);
CREATE INDEX idx_obra_comentarios_usuario ON public.obra_comentarios(usuario_id);

CREATE TRIGGER obra_comentarios_updated_at
  BEFORE UPDATE ON public.obra_comentarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.obra_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY obra_comentarios_select ON public.obra_comentarios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.obras o
      WHERE o.id = obra_id AND o.publicado = true AND o.status = true
    )
  );

CREATE POLICY obra_comentarios_insert_aluno ON public.obra_comentarios
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.get_my_perfil() = 'aluno'
    AND EXISTS (
      SELECT 1 FROM public.obras o
      WHERE o.id = obra_id AND o.publicado = true AND o.status = true
    )
  );

CREATE POLICY obra_comentarios_update_own ON public.obra_comentarios
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno')
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY obra_comentarios_delete_own ON public.obra_comentarios
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() AND public.get_my_perfil() = 'aluno');

-- Autores de obras publicadas: nome visível para leitores
CREATE POLICY profiles_select_obra_autores ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.obras o
      WHERE o.usuario_id = profiles.id
        AND o.publicado = true
        AND o.status = true
    )
  );

GRANT SELECT, INSERT, DELETE ON public.obra_curtidas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obra_comentarios TO authenticated;
