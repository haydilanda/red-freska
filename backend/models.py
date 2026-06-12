from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    marca_id: Optional[str]
    email: str
    marca_activa: bool = True


class RegisterRequest(BaseModel):
    empresa_nombre: str
    email: EmailStr
    password: str


# ── Marcas ────────────────────────────────────────────────────────────────────

class VozMarca(BaseModel):
    """Perfil de voz y comunicación digital de la marca."""
    personalidad: Optional[str] = None          # "El amigo peruano que siempre tiene un buen chiste..."
    estilo_escritura: Optional[str] = None      # "formal" | "informal" | "mixto"
    nivel_humor: Optional[str] = None           # "ninguno" | "sutil" | "frecuente" | "es_su_sello"
    usa_emojis: Optional[bool] = None
    plataformas_activas: Optional[List[str]] = None   # ["TikTok", "Instagram", ...]
    pilares_contenido: Optional[List[str]] = None     # ["precio accesible", "momento antojo", ...]
    temas_prohibidos: Optional[List[str]] = None      # ["política", "religión", ...]
    audiencia_nsea: Optional[str] = None        # "A" | "B" | "C" | "D" | "B/C" | "C/D" | "Todos"
    momento_consumo: Optional[List[str]] = None # ["almuerzo", "antojo nocturno", "delivery", ...]


class PerfilBase(BaseModel):
    """Campos de perfil estratégico de la marca — editables por cliente y admin."""
    publico:    Optional[str] = None
    territorio: Optional[str] = None
    tono:       Optional[str] = None
    palanca:    Optional[str] = None


class MarcaBase(BaseModel):
    nombre: str
    publico:    Optional[str] = None
    territorio: Optional[str] = None
    tono:       Optional[str] = None
    palanca:    Optional[str] = None
    plan: Optional[str] = "señal"
    activa: bool = True


class MarcaCreate(MarcaBase):
    pass


class Marca(MarcaBase):
    id: str
    voz_marca: Optional[dict] = None

    class Config:
        from_attributes = True


# ── Tendencias ────────────────────────────────────────────────────────────────

class TendenciaBase(BaseModel):
    nombre: str
    fuente: str
    categoria: str
    descripcion: str


class TendenciaCreate(TendenciaBase):
    pass


class Tendencia(TendenciaBase):
    id: str
    fecha: Optional[str]
    estado: str = "revisar"
    momentum: Optional[str] = None          # "emergente" | "pico" | "establecida"
    relevancia_food: Optional[int] = None   # 1-5
    videos_referencia: Optional[List[Any]] = None  # [{url, thumbnail, descripcion, views}]
    creada_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Scores ────────────────────────────────────────────────────────────────────

class ScoreRequest(BaseModel):
    tendencia_id: str
    marca_id: str


class BriefData(BaseModel):
    """
    Acepta tanto el formato nuevo (dict/list estructurado)
    como el formato legacy (strings planos).
    Se usa Any para no romper los briefs ya guardados en BD.
    """
    angulo: Optional[Any] = None
    formato: Optional[Any] = None
    cta: Optional[Any] = None

    class Config:
        extra = 'allow'


class ScoreResult(BaseModel):
    tendencia_id: str
    marca_id: str
    score_publico: int
    score_territorio: int
    score_tono: int
    score_final: float
    activar: bool
    razon: str
    brief: Optional[BriefData] = None
    creada_at: Optional[datetime] = None


class BatchScoringRequest(BaseModel):
    marca_ids: Optional[List[str]] = None   # None = todas las marcas
    tendencia_ids: Optional[List[str]] = None  # None = todas las tendencias


class BatchScoringResult(BaseModel):
    procesadas: int
    scores: List[ScoreResult]


# ── Feedback ──────────────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    score_id: str
    ejecutaron: bool
    resultado: str          # "bueno" | "regular" | "malo"
    metricas: Optional[str] = None


# ── CSV Upload ────────────────────────────────────────────────────────────────

class CSVRow(BaseModel):
    nombre: str
    fuente: str
    categoria: str
    descripcion: str
    fecha: Optional[str] = None
