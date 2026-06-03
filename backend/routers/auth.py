from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from models import LoginRequest, LoginResponse, RegisterRequest
import os

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


def get_supabase():
    return create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY"),
    )


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    sb = get_supabase()

    try:
        res = sb.auth.sign_in_with_password(
            {"email": data.email, "password": data.password}
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    user_id = res.user.id
    access_token = res.session.access_token

    # Obtener perfil del usuario (rol + marca_id)
    perfil = (
        sb.table("usuarios")
        .select("rol, marca_id")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not perfil.data:
        raise HTTPException(status_code=404, detail="Perfil de usuario no encontrado")

    # Verificar si la marca está activa (solo para clientes)
    marca_activa = True
    if perfil.data["rol"] == "cliente" and perfil.data.get("marca_id"):
        marca_res = (
            sb.table("marcas")
            .select("activa")
            .eq("id", perfil.data["marca_id"])
            .single()
            .execute()
        )
        if marca_res.data:
            marca_activa = bool(marca_res.data["activa"])

    return LoginResponse(
        access_token=access_token,
        rol=perfil.data["rol"],
        marca_id=perfil.data.get("marca_id"),
        email=data.email,
        marca_activa=marca_activa,
    )


@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    """
    Registro público: crea la marca (inactiva) + usuario.
    El admin debe activar la cuenta desde el panel de Clientes.
    """
    sb = get_supabase()
    marca_id = None
    user_id = None

    # 1 — Crear marca en estado pendiente
    try:
        marca_res = sb.table("marcas").insert({
            "nombre": data.empresa_nombre,
            "publico":    "",
            "territorio": "",
            "tono":       "",
            "palanca":    "",
            "activa": False,
            "plan": "señal",
        }).execute()
        marca_id = marca_res.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear la marca: {e}")

    # 2 — Crear usuario en Supabase Auth
    try:
        auth_res = sb.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,   # sin verificación por email por ahora
        })
        user_id = auth_res.user.id
    except Exception as e:
        sb.table("marcas").delete().eq("id", marca_id).execute()
        msg = str(e).lower()
        if "already" in msg or "exists" in msg:
            raise HTTPException(status_code=409, detail="Este email ya está registrado")
        raise HTTPException(status_code=400, detail=f"Error al crear el usuario: {e}")

    # 3 — Crear perfil en tabla usuarios
    try:
        sb.table("usuarios").insert({
            "id": user_id,
            "email": data.email,
            "rol": "cliente",
            "marca_id": marca_id,
        }).execute()
    except Exception as e:
        # Rollback completo
        sb.auth.admin.delete_user(user_id)
        sb.table("marcas").delete().eq("id", marca_id).execute()
        raise HTTPException(status_code=500, detail=f"Error al crear el perfil: {e}")

    return {
        "mensaje": "Solicitud recibida. Tu cuenta será activada en 24-48 horas hábiles.",
        "empresa": data.empresa_nombre,
    }


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    sb = get_supabase()
    sb.auth.sign_out()
    return {"message": "Sesión cerrada"}


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependencia reutilizable para rutas protegidas."""
    sb = get_supabase()
    try:
        user = sb.auth.get_user(credentials.credentials)
        if not user.user:
            raise HTTPException(status_code=401, detail="Token inválido")

        perfil = (
            sb.table("usuarios")
            .select("id, rol, marca_id, email")
            .eq("id", user.user.id)
            .single()
            .execute()
        )
        return perfil.data
    except Exception:
        raise HTTPException(status_code=401, detail="No autorizado")
