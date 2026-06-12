from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from supabase import create_client
from routers.auth import get_current_user
from services.apify import run_tiktok_scraper, formatear_para_claude
from services.trend_detector import detectar_tendencias
from services.scoring import calcular_score
from routers.scores import score_to_dict
from datetime import date
import os

router = APIRouter(prefix="/deteccion", tags=["deteccion"])

_estado_deteccion = {
    "corriendo": False,
    "fase": None,          # "scraping" | "detectando" | "scoring" | None
    "ultimo_resultado": None,
    "error": None,
}

# Campos permitidos al insertar una tendencia detectada por IA
CAMPOS_TENDENCIA = {"nombre", "fuente", "categoria", "descripcion", "fecha", "momentum", "relevancia_food"}


def get_supabase():
    return create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY"),
    )


def require_admin(user=Depends(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Solo admins")
    return user


def _run_deteccion():
    global _estado_deteccion
    _estado_deteccion["corriendo"] = True
    _estado_deteccion["error"] = None

    try:
        apify_key  = os.getenv("APIFY_API_KEY")
        claude_key = os.getenv("ANTHROPIC_API_KEY")
        fecha_hoy  = date.today().isoformat()
        sb         = get_supabase()

        # ── Fase 1: Scraping TikTok ───────────────────────────────────────────
        _estado_deteccion["fase"] = "scraping"
        print("[Detección] Scraping TikTok via Apify...")
        items = run_tiktok_scraper(apify_key, max_videos=80)
        # Pasar top 60 ordenados por engagement a Claude
        contenido = formatear_para_claude(items, top_n=60)

        # ── Fase 2: Claude detecta tendencias ────────────────────────────────
        _estado_deteccion["fase"] = "detectando"
        print("[Detección] Claude identificando tendencias...")

        # Cargar tendencias existentes para que Claude evite duplicados
        existentes_bd  = sb.table("tendencias").select("id,nombre").order("creada_at", desc=True).limit(100).execute()
        nombres_en_bd  = [r["nombre"] for r in existentes_bd.data]
        existentes_map = {r["nombre"]: r["id"] for r in existentes_bd.data}

        tendencias = detectar_tendencias(contenido, claude_key, fecha_hoy, nombres_en_bd)

        if not tendencias:
            raise ValueError("Claude no detectó tendencias en los datos")

        # ── Capa 4: Filtro post-detección ────────────────────────────────────
        # Solo pasan tendencias con relevancia food >= 3 y no solo "establecidas"
        antes = len(tendencias)
        tendencias = [
            t for t in tendencias
            if (t.get("relevancia_food") or 0) >= 3
        ]
        print(f"[Capa 4] {antes} detectadas → {len(tendencias)} pasaron filtro relevancia_food >= 3")

        # Verificar cuáles ya existen por nombre exacto
        nombres_detectados = [t["nombre"] for t in tendencias]
        chequeo = sb.table("tendencias").select("id,nombre").in_("nombre", nombres_detectados).execute()
        for r in chequeo.data:
            existentes_map[r["nombre"]] = r["id"]

        # Insertar solo las nuevas, filtrando campos para no romper el schema de BD
        nuevas = []
        for t in tendencias:
            if t["nombre"] not in existentes_map:
                fila = {k: v for k, v in t.items() if k in CAMPOS_TENDENCIA}
                fila["estado"] = "revisar"   # siempre entra en revisión, no publicada directamente
                nuevas.append(fila)

        insertadas = []
        if nuevas:
            res = sb.table("tendencias").insert(nuevas).execute()
            insertadas = res.data
            for t in insertadas:
                existentes_map[t["nombre"]] = t["id"]
            print(f"[Detección] {len(insertadas)} tendencias nuevas insertadas")

        # ── Fase 3: Scoring automático con Claude ────────────────────────────
        _estado_deteccion["fase"] = "scoring"
        print("[Detección] Corriendo scoring automático...")

        marcas = sb.table("marcas").select("*").eq("activa", True).execute().data

        scores_ok  = 0
        scores_err = 0
        tendencias_a_scorear = [t for t in tendencias if t["nombre"] in existentes_map]

        for tendencia_data in tendencias_a_scorear:
            tend_id  = existentes_map[tendencia_data["nombre"]]
            tend_row = sb.table("tendencias").select("*").eq("id", tend_id).single().execute().data
            for marca in marcas:
                try:
                    score = calcular_score(
                        marca_id=marca["id"],
                        marca_nombre=marca["nombre"],
                        marca_perfil=marca,
                        tendencia_id=tend_id,
                        tendencia_nombre=tend_row["nombre"],
                        tendencia_descripcion=tend_row["descripcion"],
                        api_key=claude_key,
                    )
                    sb.table("scores").upsert(
                        score_to_dict(score), on_conflict="tendencia_id,marca_id"
                    ).execute()
                    print(f"  OK {marca['nombre']} × {tend_row['nombre']} → {score.score_final}")
                    scores_ok += 1
                except Exception as e:
                    print(f"  Error {marca['nombre']} × {tend_row['nombre']}: {e}")
                    scores_err += 1

        _estado_deteccion["ultimo_resultado"] = {
            "total_detectadas":  len(tendencias),
            "nuevas_insertadas": len(insertadas),
            "ya_existian":       len(tendencias) - len(nuevas),
            "scores_calculados": scores_ok,
            "scores_error":      scores_err,
            "fecha":             fecha_hoy,
        }
        print(f"[Detección] Completado: {scores_ok} scores OK, {scores_err} errores")

    except Exception as e:
        print(f"[Detección] Error en fase '{_estado_deteccion.get('fase')}': {e}")
        _estado_deteccion["error"] = str(e)
    finally:
        _estado_deteccion["corriendo"] = False
        _estado_deteccion["fase"] = None


@router.post("/iniciar")
async def iniciar_deteccion(
    background_tasks: BackgroundTasks,
    user=Depends(require_admin),
):
    if _estado_deteccion["corriendo"]:
        raise HTTPException(status_code=409, detail="Ya hay una detección en curso")

    background_tasks.add_task(_run_deteccion)
    return {"mensaje": "Detección iniciada. TikTok → Claude → Base de datos.", "corriendo": True}


@router.get("/estado")
async def estado_deteccion(user=Depends(require_admin)):
    return _estado_deteccion
