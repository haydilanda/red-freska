import httpx
import time
import os
from typing import List

APIFY_BASE = "https://api.apify.com/v2"

# TikTok Hashtag Scraper — ID directo de Apify store
TIKTOK_ACTOR = "f1ZeP0K58iwlqG2pY"

# ── Hashtags estratificados ───────────────────────────────────────────────────
# Capa 1: Culturales generales — capturan el pulso del limeño
HASHTAGS_CULTURA = [
    "peru", "lima", "peruano", "peruanos", "limeño",
    "viral_peru", "fyp_peru", "tendenciasperu",
]

# Capa 2: Food & lifestyle — señal directa para marcas de alimentos
HASHTAGS_FOOD = [
    "comidaperuana", "gastronomiaperuanas", "antojoslima",
    "foodtiktokperu", "deliverylima", "qcomerlima",
    "fastfoodperu", "eatertok",
]

# Capa 3: Cultura pop / momentos de consumo — cuando la gente come + hace algo
HASHTAGS_MOMENTO = [
    "nochedelima", "findesemana", "reunionfamiliar",
    "humor_peruano", "memesperu", "videoviral_peru",
]

HASHTAGS_PERU = HASHTAGS_CULTURA + HASHTAGS_FOOD + HASHTAGS_MOMENTO


def _headers(api_key: str) -> dict:
    return {"Authorization": f"Bearer {api_key}"}


def _engagement_score(item: dict) -> float:
    """
    Calcula un score compuesto de engagement.
    Shares valen 3x porque implican distribución activa.
    Comentarios valen 2x porque implican respuesta emocional.
    """
    stats = item.get("stats") or {}
    plays    = item.get("playCount")    or stats.get("playCount",    0) or 0
    likes    = item.get("diggCount")    or stats.get("diggCount",    0) or 0
    comments = item.get("commentCount") or stats.get("commentCount", 0) or 0
    shares   = item.get("shareCount")   or stats.get("shareCount",   0) or 0

    if plays == 0:
        return 0.0

    # Engagement rate ponderado
    engagement = (likes + comments * 2 + shares * 3) / max(plays, 1)
    # Score final: volumen × calidad
    return plays * engagement


def _autor_tier(followers: int) -> str:
    """Clasifica el tamaño del creador para que Claude vea si es tendencia
    orgánica (muchos micros) o empuje de un solo influencer grande."""
    if followers >= 1_000_000:
        return "mega-influencer"
    if followers >= 100_000:
        return "macro-creator"
    if followers >= 10_000:
        return "micro-creator"
    return "usuario-común"


def run_tiktok_scraper(api_key: str, max_videos: int = 80) -> List[dict]:
    """
    Lanza el scraper de TikTok en Apify y espera el resultado.
    Retorna lista de videos con título, descripción, hashtags y métricas.
    """
    payload = {
        "hashtags": HASHTAGS_PERU,
        "resultsPerPage": max_videos,
        "maxProfilesPerQuery": 3,
        "shouldDownloadVideos": False,
        "shouldDownloadCovers": False,
        "shouldDownloadSlideshowImages": False,
    }

    with httpx.Client(timeout=30) as client:
        run_res = client.post(
            f"{APIFY_BASE}/acts/{TIKTOK_ACTOR}/runs",
            headers=_headers(api_key),
            json=payload,
        )
        run_res.raise_for_status()
        run_id = run_res.json()["data"]["id"]

    print(f"[Apify] Run iniciado: {run_id}")
    for _ in range(36):
        time.sleep(5)
        with httpx.Client(timeout=15) as client:
            status_res = client.get(
                f"{APIFY_BASE}/actor-runs/{run_id}",
                headers=_headers(api_key),
            )
            status = status_res.json()["data"]["status"]
        print(f"[Apify] Status: {status}")
        if status == "SUCCEEDED":
            break
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            raise RuntimeError(f"Apify run falló con status: {status}")

    dataset_id = run_res.json()["data"]["defaultDatasetId"]
    with httpx.Client(timeout=30) as client:
        data_res = client.get(
            f"{APIFY_BASE}/datasets/{dataset_id}/items?limit=300",
            headers=_headers(api_key),
        )
        data_res.raise_for_status()

    items = data_res.json()
    print(f"[Apify] {len(items)} videos obtenidos de TikTok")
    return items


def formatear_para_claude(items: List[dict], top_n: int = 60) -> str:
    """
    Convierte los videos crudos de TikTok en texto enriquecido para Claude.

    Mejoras vs versión anterior:
    - Ordena por engagement ponderado (shares × 3, comments × 2) antes de enviar
    - Incluye shares y comentarios — señales clave de viralidad real
    - Incluye fecha de publicación — Claude detecta si es tendencia fresca o ya conocida
    - Incluye tier del autor — distingue tendencia orgánica vs empuje de un influencer
    - Incluye nombre del sonido/audio — las tendencias musicales de TikTok son enormes
    """
    # Ordenar por engagement score descendente
    items_ordenados = sorted(items, key=_engagement_score, reverse=True)

    lineas = []
    for i, item in enumerate(items_ordenados[:top_n], 1):
        stats   = item.get("stats") or {}
        plays   = item.get("playCount")    or stats.get("playCount",    0) or 0
        likes   = item.get("diggCount")    or stats.get("diggCount",    0) or 0
        comments= item.get("commentCount") or stats.get("commentCount", 0) or 0
        shares  = item.get("shareCount")   or stats.get("shareCount",   0) or 0

        desc     = (item.get("text") or item.get("desc") or "")[:220]
        hashtags = " ".join(f"#{h}" for h in (item.get("hashtags") or [])[:10])

        # Fecha de publicación
        create_time = item.get("createTime") or item.get("createTimeISO") or ""
        fecha_str   = str(create_time)[:10] if create_time else "fecha desconocida"

        # Autor
        author = item.get("authorMeta") or item.get("author") or {}
        followers = author.get("fans") or author.get("followerCount") or 0
        tier = _autor_tier(followers)

        # Sonido / audio — clave para detectar trends musicales
        music = item.get("musicMeta") or item.get("music") or {}
        sound_name = (music.get("musicName") or music.get("title") or "").strip()
        sound_str  = f' | 🎵 "{sound_name[:60]}"' if sound_name else ""

        lineas.append(
            f"{i}. [{plays:,} views · {likes:,} likes · {comments:,} cmts · {shares:,} shares]"
            f" [{fecha_str}] [{tier}]{sound_str}\n"
            f"   {desc}\n"
            f"   {hashtags}"
        )

    return "\n\n".join(lineas)
