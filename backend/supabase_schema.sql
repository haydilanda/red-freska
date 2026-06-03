-- ═══════════════════════════════════════════════════════════════
-- RED FRESKA — Schema de base de datos para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ── MARCAS ──────────────────────────────────────────────────────
create table marcas (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  publico     text not null,
  territorio  text not null,
  tono        text not null,
  palanca     text not null,
  plan        text not null default 'señal',  -- señal | cultural | multi_sede
  activa      boolean not null default true,
  creada_at   timestamptz not null default now()
);

-- ── USUARIOS ─────────────────────────────────────────────────────
-- Extiende auth.users de Supabase Auth
create table usuarios (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  rol       text not null check (rol in ('admin', 'cliente')),
  marca_id  uuid references marcas(id) on delete set null
);

-- ── TENDENCIAS ───────────────────────────────────────────────────
create table tendencias (
  id           uuid primary key default uuid_generate_v4(),
  nombre       text not null,
  fuente       text not null,
  fecha        date,
  categoria    text not null,
  descripcion  text not null,
  estado       text not null default 'revisar'
                 check (estado in ('publicada', 'revisar', 'rechazada')),
  creada_at    timestamptz not null default now()
);

-- ── SCORES ───────────────────────────────────────────────────────
create table scores (
  id                uuid primary key default uuid_generate_v4(),
  tendencia_id      uuid not null references tendencias(id) on delete cascade,
  marca_id          uuid not null references marcas(id) on delete cascade,
  score_publico     int not null check (score_publico between 0 and 10),
  score_territorio  int not null check (score_territorio between 0 and 10),
  score_tono        int not null check (score_tono between 0 and 10),
  score_final       numeric(4,1) not null,
  activar           boolean not null,
  razon             text not null,
  brief             jsonb,   -- { angulo, formato, cta }
  creada_at         timestamptz not null default now(),
  unique (tendencia_id, marca_id)
);

-- ── FEEDBACK ─────────────────────────────────────────────────────
create table feedback (
  id          uuid primary key default uuid_generate_v4(),
  score_id    uuid not null references scores(id) on delete cascade,
  ejecutaron  boolean not null,
  resultado   text not null check (resultado in ('bueno', 'regular', 'malo')),
  metricas    text,
  creada_at   timestamptz not null default now()
);

-- ── REPORTES ─────────────────────────────────────────────────────
create table reportes (
  id               uuid primary key default uuid_generate_v4(),
  marca_id         uuid not null references marcas(id) on delete cascade,
  semana           date not null,
  tendencias_ids   uuid[] not null default '{}',
  generado_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

alter table marcas      enable row level security;
alter table usuarios    enable row level security;
alter table tendencias  enable row level security;
alter table scores      enable row level security;
alter table feedback    enable row level security;
alter table reportes    enable row level security;

-- Función helper para obtener el rol del usuario actual
create or replace function get_my_rol()
returns text as $$
  select rol from usuarios where id = auth.uid();
$$ language sql security definer;

-- Función helper para obtener la marca del usuario actual
create or replace function get_my_marca_id()
returns uuid as $$
  select marca_id from usuarios where id = auth.uid();
$$ language sql security definer;

-- ── Políticas MARCAS ─────────────────────────────────────────────
-- Admin ve todo. Cliente solo ve su marca.
create policy "marcas_select" on marcas for select using (
  get_my_rol() = 'admin'
  or id = get_my_marca_id()
);
create policy "marcas_insert" on marcas for insert with check (get_my_rol() = 'admin');
create policy "marcas_update" on marcas for update using (get_my_rol() = 'admin');

-- ── Políticas USUARIOS ───────────────────────────────────────────
create policy "usuarios_select" on usuarios for select using (
  get_my_rol() = 'admin' or id = auth.uid()
);

-- ── Políticas TENDENCIAS ─────────────────────────────────────────
-- Cliente solo ve publicadas. Admin ve todo.
create policy "tendencias_select" on tendencias for select using (
  get_my_rol() = 'admin'
  or estado = 'publicada'
);
create policy "tendencias_insert" on tendencias for insert with check (get_my_rol() = 'admin');
create policy "tendencias_update" on tendencias for update using (get_my_rol() = 'admin');

-- ── Políticas SCORES ─────────────────────────────────────────────
-- Cliente solo ve scores de su marca. Admin ve todo.
create policy "scores_select" on scores for select using (
  get_my_rol() = 'admin'
  or marca_id = get_my_marca_id()
);
create policy "scores_insert" on scores for insert with check (get_my_rol() = 'admin');
create policy "scores_update" on scores for update using (get_my_rol() = 'admin');

-- ── Políticas FEEDBACK ───────────────────────────────────────────
create policy "feedback_select" on feedback for select using (
  get_my_rol() = 'admin'
  or exists (
    select 1 from scores s
    where s.id = feedback.score_id
    and s.marca_id = get_my_marca_id()
  )
);
create policy "feedback_insert" on feedback for insert with check (
  exists (
    select 1 from scores s
    where s.id = score_id
    and s.marca_id = get_my_marca_id()
  )
);

-- ═══════════════════════════════════════════════════════════════
-- DATOS INICIALES
-- ═══════════════════════════════════════════════════════════════

-- Marcas piloto
insert into marcas (nombre, publico, territorio, tono, palanca, plan) values
(
  'Norkys',
  'Familia popular, NSE C/D, 25-50 años',
  'Peruanidad, celebración familiar, orgullo local',
  'Cálido, directo, festivo. Nunca irónico ni elitista',
  'Orgullo peruano, la reunión familiar',
  'cultural'
),
(
  'Papa John''s',
  'Jóvenes digitales, NSE B/C, 18-30 años',
  'Cultura pop, gaming, noche, entretenimiento',
  'Irreverente, joven, bold. Puede ser meme-friendly',
  'Pertenencia a tribu, el grupo, la sesión',
  'señal'
),
(
  'Starbucks',
  'Adultos aspiracionales, NSE A/B, 22-35 años',
  'Bienestar, lifestyle, música, estética, identidad',
  'Aspiracional, calmado, moderno. Nunca ruidoso',
  'Identidad de estilo de vida',
  'multi_sede'
);

-- Nota: Los usuarios (admin + clientes) se crean desde Supabase Auth Dashboard
-- o via API. Ver instrucciones en README.
