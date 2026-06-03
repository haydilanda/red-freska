from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from supabase import create_client
from models import ScoreRequest, ScoreResult, BatchScoringRequest, BatchScoringResult, FeedbackCreate
from routers.auth import get_current_user
from services.scoring import calcular_score
from typing import List, Optional
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/scores", tags=["scores"])

# Flag global de cancelación
_cancelar_scoring = False


def score_to_dict(score: ScoreResult) -> dict:
    """Convierte un ScoreResult a dict listo para Supabase, sin errores."""
    d = score.dict()
    brief = d.get("brief")
    if brief is None:
        d["brief"] = None
    elif isinstance(brief, dict):
        d["brief"] = brief          # ya es dict, no llamar .dict()
    else:
        d["brief"] = brief.dict()   # es un modelo Pydantic
    d["creada_at"] = datetime.now(timezone.utc).isoformat()
    return d


def get_supabase():
    return create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY"),
    )


def require_admin(user=Depends(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Solo admins")
    return user


@router.get("/", response_model=List[ScoreResult])
async def listar_scores(
    marca_id: Optional[str] = None,
    tendencia_id: Optional[str] = None,
    user=Depends(get_current_user),
):
    sb = get_supabase()
    query = sb.table("scores").select("*")

    # Cliente solo ve sus propios scores
    if user["rol"] == "cliente":
        query = query.eq("marca_id", user["marca_id"])
    elif marca_id:
        query = query.eq("marca_id", marca_id)

    if tendencia_id:
        query = query.eq("tendencia_id", tendencia_id)

    res = query.order("creada_at", desc=True).execute()
    return res.data


@router.get("/{tendencia_id}", response_model=ScoreResult)
async def obtener_score(tendencia_id: str, user=Depends(get_current_user)):
    sb = get_supabase()
    marca_id = user["marca_id"] if user["rol"] == "cliente" else None

    query = sb.table("scores").select("*").eq("tendencia_id", tendencia_id)
    if marca_id:
        query = query.eq("marca_id", marca_id)

    res = query.execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Score no encontrado")
    return res.data[0]


@router.post("/calcular", response_model=ScoreResult)
async def calcular_score_individual(
    req: ScoreRequest,
    user=Depends(require_admin),
):
    sb = get_supabase()

    marca_res = sb.table("marcas").select("*").eq("id", req.marca_id).single().execute()
    if not marca_res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")

    tend_res = (
        sb.table("tendencias")
        .select("*")
        .eq("id", req.tendencia_id)
        .single()
        .execute()
    )
    if not tend_res.data:
        raise HTTPException(status_code=404, detail="Tendencia no encontrada")

    marca = marca_res.data
    tendencia = tend_res.data

    score = calcular_score(
        marca_id=req.marca_id,
        marca_nombre=marca["nombre"],
        marca_perfil=marca,
        tendencia_id=req.tendencia_id,
        tendencia_nombre=tendencia["nombre"],
        tendencia_descripcion=tendencia["descripcion"],
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )

    # Guardar en Supabase (upsert por marca+tendencia)
    sb.table("scores").upsert(
        score_to_dict(score),
        on_conflict="tendencia_id,marca_id",
    ).execute()

    return score


def _run_batch(marcas: list, tendencias: list, api_key: str):
    """Ejecuta el scoring en background para no bloquear el servidor."""
    global _cancelar_scoring
    _cancelar_scoring = False
    sb = get_supabase()
    for marca in marcas:
        for tendencia in tendencias:
            if _cancelar_scoring:
                print("=== Scoring cancelado por el usuario ===")
                return
            try:
                score = calcular_score(
                    marca_id=marca["id"],
                    marca_nombre=marca["nombre"],
                    marca_perfil=marca,
                    tendencia_id=tendencia["id"],
                    tendencia_nombre=tendencia["nombre"],
                    tendencia_descripcion=tendencia["descripcion"],
                    api_key=api_key,
                )
                sb.table("scores").upsert(
                    score_to_dict(score),
                    on_conflict="tendencia_id,marca_id",
                ).execute()
                print(f"OK {marca['nombre']} × {tendencia['nombre']} → {score.score_final}")
            except Exception as e:
                print(f"Error scoring {marca['nombre']} × {tendencia['nombre']}: {e}")
    print("=== Scoring batch completado ===")


@router.post("/batch")
async def scoring_batch(
    req: BatchScoringRequest,
    background_tasks: BackgroundTasks,
    user=Depends(require_admin),
):
    """Lanza el scoring en background y devuelve inmediatamente."""
    sb = get_supabase()
    api_key = os.getenv("ANTHROPIC_API_KEY")

    marcas_query = sb.table("marcas").select("*").eq("activa", True)
    if req.marca_ids:
        marcas_query = marcas_query.in_("id", req.marca_ids)
    marcas = marcas_query.execute().data

    tends_query = sb.table("tendencias").select("*").neq("estado", "rechazada")
    if req.tendencia_ids:
        tends_query = tends_query.in_("id", req.tendencia_ids)
    tendencias = tends_query.execute().data

    background_tasks.add_task(_run_batch, marcas, tendencias, api_key)

    return {"mensaje": f"Scoring iniciado: {len(marcas)} marcas × {len(tendencias)} tendencias", "procesando": True}


@router.post("/batch/cancel")
async def cancelar_scoring(user=Depends(require_admin)):
    global _cancelar_scoring
    _cancelar_scoring = True
    return {"mensaje": "Scoring cancelado"}


@router.post("/feedback")
async def registrar_feedback(data: FeedbackCreate, user=Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("feedback").insert(data.dict()).execute()
    return {"mensaje": "Feedback registrado", "id": res.data[0]["id"]}
