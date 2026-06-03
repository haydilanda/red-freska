# Red Freska — Setup del Backend

## 1. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus claves reales
```

## 2. Claves necesarias

### Supabase
1. Ve a https://supabase.com → New project
2. Settings → API → copia `Project URL` y `service_role key`
3. Pega en .env como SUPABASE_URL y SUPABASE_SERVICE_KEY

### Anthropic (Claude API)
1. Ve a https://console.anthropic.com
2. API Keys → Create Key
3. Pega en .env como ANTHROPIC_API_KEY

## 3. Crear tablas en Supabase

1. Supabase Dashboard → SQL Editor
2. Pega y ejecuta el contenido de `supabase_schema.sql`

## 4. Crear usuarios en Supabase Auth

En Supabase Dashboard → Authentication → Users → Add user:
- admin@redfreska.com / tu_password
- norkys@redfreska.com / tu_password
- papajohns@redfreska.com / tu_password
- starbucks@redfreska.com / tu_password

Luego en SQL Editor, vincula cada usuario con su perfil:
```sql
-- Reemplaza los UUIDs con los que Supabase generó para cada usuario
insert into usuarios (id, email, rol, marca_id) values
  ('<uuid-admin>',    'admin@redfreska.com',     'admin',   null),
  ('<uuid-norkys>',   'norkys@redfreska.com',    'cliente', (select id from marcas where nombre='Norkys')),
  ('<uuid-papajohns>','papajohns@redfreska.com', 'cliente', (select id from marcas where nombre='Papa John''s')),
  ('<uuid-starbucks>','starbucks@redfreska.com', 'cliente', (select id from marcas where nombre='Starbucks'));
```

## 5. Correr el servidor

```bash
# Activar entorno virtual
source venv/bin/activate

# Iniciar FastAPI
uvicorn main:app --reload --port 8000
```

Documentación interactiva disponible en: http://localhost:8000/docs

## 6. Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Login con email + password |
| GET | /marcas/ | Listar marcas (según rol) |
| GET | /tendencias/ | Listar tendencias |
| POST | /tendencias/upload-csv | Subir CSV con tendencias |
| POST | /scores/calcular | Score individual via Claude |
| POST | /scores/batch | Scoring masivo todas las marcas |
| POST | /scores/feedback | Registrar feedback del cliente |
