from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client
from models import Marca, MarcaCreate, VozMarca, PerfilBase
from routers.auth import get_current_user
from typing import List
import os

router = APIRouter(prefix="/marcas", tags=["marcas"])


def get_supabase():
    return create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY"),
    )


def require_admin(user=Depends(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Solo admins pueden realizar esta acción")
    return user


@router.get("/", response_model=List[Marca])
async def listar_marcas(user=Depends(get_current_user)):
    sb = get_supabase()

    if user["rol"] == "cliente":
        # Cliente solo ve su propia marca si está activa
        res = (
            sb.table("marcas")
            .select("*")
            .eq("id", user["marca_id"])
            .eq("activa", True)
            .execute()
        )
    else:
        # Admin ve TODAS las marcas: activas y pendientes de activación
        res = sb.table("marcas").select("*").order("activa", desc=True).execute()

    return res.data


@router.patch("/{marca_id}/activar", response_model=Marca)
async def activar_marca(marca_id: str, user=Depends(require_admin)):
    """Activa una marca pendiente. Solo admins."""
    sb = get_supabase()
    res = (
        sb.table("marcas")
        .update({"activa": True})
        .eq("id", marca_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return res.data[0]


@router.get("/{marca_id}", response_model=Marca)
async def obtener_marca(marca_id: str, user=Depends(get_current_user)):
    sb = get_supabase()

    # Verificar que el cliente solo acceda a su marca
    if user["rol"] == "cliente" and user["marca_id"] != marca_id:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    res = sb.table("marcas").select("*").eq("id", marca_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")

    return res.data


@router.post("/", response_model=Marca)
async def crear_marca(marca: MarcaCreate, user=Depends(require_admin)):
    sb = get_supabase()
    res = sb.table("marcas").insert(marca.dict()).execute()
    return res.data[0]


@router.patch("/{marca_id}", response_model=Marca)
async def actualizar_marca(
    marca_id: str, updates: dict, user=Depends(require_admin)
):
    sb = get_supabase()
    res = (
        sb.table("marcas")
        .update(updates)
        .eq("id", marca_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return res.data[0]


@router.patch("/{marca_id}/perfil", response_model=Marca)
async def actualizar_perfil_base(
    marca_id: str,
    perfil: PerfilBase,
    user=Depends(get_current_user),
):
    """Actualiza el perfil base estratégico (público, territorio, tono, palanca).
    El cliente solo puede editar su propia marca; el admin puede editar cualquiera.
    """
    if user["rol"] == "cliente" and user["marca_id"] != marca_id:
        raise HTTPException(status_code=403, detail="Solo puedes editar tu propia marca")

    sb = get_supabase()
    # Solo actualizar los campos que vienen con valor (no sobreescribir con None)
    campos = {k: v for k, v in perfil.dict().items() if v is not None}
    if not campos:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    res = sb.table("marcas").update(campos).eq("id", marca_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return res.data[0]


@router.patch("/{marca_id}/voz")
async def actualizar_voz_marca(
    marca_id: str,
    voz: VozMarca,
    user=Depends(get_current_user),
):
    """Actualiza el perfil de voz digital de la marca.
    El cliente solo puede editar su propia marca; el admin puede editar cualquiera.
    """
    if user["rol"] == "cliente" and user["marca_id"] != marca_id:
        raise HTTPException(status_code=403, detail="Solo puedes editar tu propia marca")

    sb = get_supabase()
    res = (
        sb.table("marcas")
        .update({"voz_marca": voz.dict()})
        .eq("id", marca_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return {"mensaje": "Voz de marca actualizada correctamente", "voz_marca": res.data[0].get("voz_marca")}
