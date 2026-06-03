from .llm import score_tendencia, generar_brief
from models import ScoreResult, BriefData
from typing import Optional


def calcular_score(
    marca_id: str,
    marca_nombre: str,
    marca_perfil: dict,
    tendencia_id: str,
    tendencia_nombre: str,
    tendencia_descripcion: str,
    api_key: str,
) -> ScoreResult:
    resultado = score_tendencia(
        marca_nombre=marca_nombre,
        marca_perfil=marca_perfil,
        tendencia_nombre=tendencia_nombre,
        tendencia_descripcion=tendencia_descripcion,
        api_key=api_key,
    )

    scores = resultado["scores"]
    score_final = resultado["score_final"]
    activar = resultado["activar"]
    razon = resultado["razon"]

    brief = None
    if activar:
        brief_raw = generar_brief(
            marca_nombre=marca_nombre,
            marca_perfil=marca_perfil,
            tendencia_nombre=tendencia_nombre,
            razon=razon,
            api_key=api_key,
        )
        brief = BriefData(
            angulo=brief_raw["angulo"],
            formato=brief_raw["formato"],
            cta=brief_raw["cta"],
        )

    return ScoreResult(
        tendencia_id=tendencia_id,
        marca_id=marca_id,
        score_publico=scores["publico"],
        score_territorio=scores["territorio"],
        score_tono=scores["tono"],
        score_final=score_final,
        activar=activar,
        razon=razon,
        brief=brief,
    )
