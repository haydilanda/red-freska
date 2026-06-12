import httpx
import time
import os
import re
from datetime import datetime, timezone, timedelta
from typing import List

APIFY_BASE = "https://api.apify.com/v2"

# TikTok Hashtag Scraper — ID directo de Apify store
TIKTOK_ACTOR = "f1ZeP0K58iwlqG2pY"

# ── Hashtags estratificados ───────────────────────────────────────────────────
# Enfocados en cultura + food + momentos de consumo
# Eliminamos hashtags demasiado genéricos que traen ruido político
HASHTAGS_CULTURA = [
    "peruano", "peruanos", "viral_peru", "fyp_peru", "tendenciasperu",
    "humor_peruano", "memesperu", "orgullo_peruano",
]

HASHTAGS_FOOD = [
    "comidaperuana", "gastronomiaperuanas", "antojoslima",
    "foodtiktokperu", "deliverylima", "qcomerlima",
    "fastfoodperu", "eatertok", "comidacallejera",
    "recetasperuanas", "dondecomer",
]

HASHTAGS_MOMENTO = [
    "nochedelima", "findesemana", "reunionfamiliar",
    "videoviral_peru", "momentosperuanos", "vidaenelperu",
]

HASHTAGS_PERU = HASHTAGS_CULTURA + HASHTAGS_FOOD + HASHTAGS_MOMENTO

# ── Capa 2: Pre-filtro duro ───────────────────────────────────────────────────

# Palabras que indican contenido irrelevante para marcas de food
# Si el texto del video contiene alguna de estas → se descarta automáticamente
PALABRAS_RUIDO = [
    # Política
    "elecciones", "candidato", "partido político", "presidente", "congreso",
    "senado", "voto", "campaña electoral", "boluarte", "castillo", "fujimori",
    "keiko", "acción popular", "fuerza popular", "perú libre",
    # Desastres
    "sismo", "terremoto", "tsunami", "huaico", "deslizamiento", "inundacion",
    "alud", "desastre natural", "emergencia nacional",
    # Crimen / violencia
    "crimen", "asesinato", "sicario", "extorsion", "secuestro", "narcotráfico",
    "banda criminal", "feminicidio", "violación",
    # Noticias negativas
    "accidente de tránsito", "muertos", "fallecidos", "víctimas",
    "luto nacional", "tragedia",
]

# Engagement mínimo: descartar videos con muy poca tracción
MIN_VIEWS    = 5_000    # al menos 5k vistas
MIN_ENG_RATE = 0.015    # al menos 1.5% engagement rate (likes+cmts+shares / views)

# Antigüedad máxima: tendencias de más de 21 días ya pasaron
MAX_DIAS_ANTIGUEDAD = 21


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


def _prefiltrar(items: List[dict]) -> List[dict]:
    """
    Capa 2 del embudo: pre-filtro duro antes de enviar a Claude.
    Elimina ruido político, viral sin sustancia y contenido viejo.
    Retorna solo videos con potencial real de tendencia food-relevant.
    """
    ahora = datetime.now(timezone.utc)
    limite_fecha = ahora - timedelta(days=MAX_DIAS_ANTIGUEDAD)
    aprobados = []
    descartados = {"ruido": 0, "engagement": 0, "antiguo": 0}

    for item in items:
        texto = (
            (item.get("text") or item.get("desc") or "") + " " +
            " ".join(item.get("hashtags") or [])
        ).lower()

        # ── Filtro 1: palabras de ruido ──────────────────────────────────────
        if any(palabra in texto for palabra in PALABRAS_RUIDO):
            descartados["ruido"] += 1
            continue

        # ── Filtro 2: engagement mínimo ──────────────────────────────────────
        stats    = item.get("stats") or {}
        plays    = item.get("playCount")    or stats.get("playCount",    0) or 0
        likes    = item.get("diggCount")    or stats.get("diggCount",    0) or 0
        comments = item.get("commentCount") or stats.get("commentCount", 0) or 0
        shares   = item.get("shareCount")   or stats.get("shareCount",   0) or 0

        if plays < MIN_VIEWS:
            descartados["engagement"] += 1
            continue

        eng_rate = (likes + comments + shares) / max(plays, 1)
        if eng_rate < MIN_ENG_RATE:
            descartados["engagement"] += 1
            continue

        # ── Filtro 3: antigüedad ─────────────────────────────────────────────
        create_time = item.get("createTime")
        if create_time:
            try:
                # createTime puede ser unix timestamp (int) o ISO string
                if isinstance(create_time, (int, float)):
                    fecha_video = datetime.fromtimestamp(create_time, tz=timezone.utc)
                else:
                    fecha_video = datetime.fromisoformat(str(create_time)[:19]).replace(tzinfo=timezone.utc)
                if fecha_video < limite_fecha:
                    descartados["antiguo"] += 1
                    continue
            except Exception:
                pass  # si no podemos parsear la fecha, dejamos pasar

        aprobados.append(item)

    total = len(items)
    print(
        f"[Pre-filtro] {total} videos → {len(aprobados)} aprobados "
        f"({descartados['ruido']} ruido político, "
        f"{descartados['engagement']} bajo engagement, "
        f"{descartados['antiguo']} muy antiguos)"
    )
    return aprobados


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


def run_tiktok_ads_scraper(api_key: str, max_ads: int = 30) -> List[dict]:
    """
    Capa 1 adicional: scraping de TikTok Ads Library / Creative Center.
    Extrae los anuncios TOP de Food & Beverage en Perú.

    Por qué es valioso: si una marca está pagando por ese contenido,
    ya validó que funciona. Es señal comercial, no solo cultural.

    Actor: IbRCaDNVKREcwlNJ8 — TikTok Ads Library Scraper (Ad Library + Creative Center)
    """
    ADS_ACTOR = "IbRCaDNVKREcwlNJ8"

    payload = {
        "countryCode": "PE",          # Perú
        "adLanguage": "es",           # español
        "industry": "food_beverage",  # Food & Beverage
        "period": "7",                # últimos 7 días
        "resultsPerPage": max_ads,
        "sortBy": "engagement_rate",  # los de mayor engagement primero
    }

    try:
        with httpx.Client(timeout=30) as client:
            run_res = client.post(
                f"{APIFY_BASE}/acts/{ADS_ACTOR}/runs",
                headers=_headers(api_key),
                json=payload,
            )
            run_res.raise_for_status()
            run_id = run_res.json()["data"]["id"]

        print(f"[Apify Ads] Run iniciado: {run_id}")
        for _ in range(24):  # máx 2 min
            time.sleep(5)
            with httpx.Client(timeout=15) as client:
                status_res = client.get(
                    f"{APIFY_BASE}/actor-runs/{run_id}",
                    headers=_headers(api_key),
                )
                status = status_res.json()["data"]["status"]
            print(f"[Apify Ads] Status: {status}")
            if status == "SUCCEEDED":
                break
            if status in ("FAILED", "ABORTED", "TIMED-OUT"):
                print(f"[Apify Ads] Run falló: {status} — continuando sin ads")
                return []

        dataset_id = run_res.json()["data"]["defaultDatasetId"]
        with httpx.Client(timeout=30) as client:
            data_res = client.get(
                f"{APIFY_BASE}/datasets/{dataset_id}/items?limit=100",
                headers=_headers(api_key),
            )
            data_res.raise_for_status()

        ads = data_res.json()
        print(f"[Apify Ads] {len(ads)} anuncios obtenidos de TikTok Ads Library")

        # Normalizar al mismo formato que los videos orgánicos
        # para que pasen por el mismo pipeline
        normalizados = []
        for ad in ads:
            normalizados.append({
                "text": ad.get("adText") or ad.get("text") or ad.get("description") or "",
                "hashtags": ad.get("hashtags") or [],
                "playCount":    ad.get("videoPlayCount") or ad.get("playCount") or 0,
                "diggCount":    ad.get("likeCount") or ad.get("diggCount") or 0,
                "commentCount": ad.get("commentCount") or 0,
                "shareCount":   ad.get("shareCount") or 0,
                "createTime":   ad.get("createTime") or ad.get("firstShownDate") or "",
                "authorMeta":   {"fans": 999_999},  # anunciante = peso alto
                "musicMeta":    {"musicName": ad.get("musicName") or ""},
                "_fuente":      "tiktok_ads",       # etiqueta de origen
                "_advertiser":  ad.get("advertiserName") or ad.get("brand") or "marca",
            })

        return normalizados

    except Exception as e:
        print(f"[Apify Ads] Error — continuando solo con scraping orgánico: {e}")
        return []


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


def extraer_url_video(item: dict) -> str:
    """Construye la URL de TikTok para un video."""
    # Intentar URL directa primero
    url = item.get("webVideoUrl") or item.get("url") or ""
    if url and "tiktok.com" in url:
        return url
    # Construir desde author + id
    video_id = item.get("id") or ""
    author = item.get("authorMeta") or item.get("author") or {}
    username = author.get("name") or author.get("uniqueId") or ""
    if video_id and username:
        return f"https://www.tiktok.com/@{username}/video/{video_id}"
    return ""


def extraer_thumbnail(item: dict) -> str:
    """Extrae la URL de la miniatura del video."""
    covers = item.get("covers") or item.get("videoMeta", {}).get("covers") or []
    if covers:
        return covers[0] if isinstance(covers[0], str) else ""
    return item.get("thumbnailUrl") or item.get("originCoverUrl") or ""


def formatear_para_claude(items: List[dict], top_n: int = 60) -> str:
    """
    Capa 2 del embudo + formateo enriquecido para Claude.

    Pipeline:
    1. Pre-filtro duro (ruido político, bajo engagement, videos viejos)
    2. Ordena por engagement ponderado (shares × 3, comments × 2)
    3. Toma los top_n más relevantes
    4. Formatea con contexto rico para Claude
    """
    # 1. Aplicar pre-filtro antes de enviar a Claude
    items_limpios = _prefiltrar(items)

    if not items_limpios:
        print("[Advertencia] Pre-filtro eliminó todos los videos. Usando datos sin filtrar.")
        items_limpios = items

    # 2. Ordenar por engagement score descendente
    items_ordenados = sorted(items_limpios, key=_engagement_score, reverse=True)

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

        # Etiqueta de origen — anuncio pagado vs contenido orgánico
        fuente = item.get("_fuente", "organico")
        advertiser = item.get("_advertiser", "")
        if fuente == "tiktok_ads":
            origen_str = f" | 💰 ANUNCIO PAGADO ({advertiser})"
        else:
            origen_str = " | 🌱 orgánico"

        lineas.append(
            f"[VIDEO_{i}] [{plays:,} views · {likes:,} likes · {comments:,} cmts · {shares:,} shares]"
            f" [{fecha_str}] [{tier}]{origen_str}{sound_str}\n"
            f"   {desc}\n"
            f"   {hashtags}"
        )

    return "\n\n".join(lineas)


def obtener_videos_por_indices(items: List[dict], indices: List[int], top_n: int = 60) -> List[dict]:
    """
    Dado una lista de índices (1-based) retornados por Claude,
    devuelve los datos de esos videos para guardarlos como referencia.
    """
    items_limpios = _prefiltrar(items)
    items_ordenados = sorted(items_limpios, key=_engagement_score, reverse=True)[:top_n]

    resultado = []
    for idx in indices:
        i = idx - 1  # convertir a 0-based
        if 0 <= i < len(items_ordenados):
            item = items_ordenados[i]
            stats = item.get("stats") or {}
            plays = item.get("playCount") or stats.get("playCount", 0) or 0
            desc  = (item.get("text") or item.get("desc") or "")[:150]
            url   = extraer_url_video(item)
            thumb = extraer_thumbnail(item)
            if url:
                resultado.append({
                    "url":         url,
                    "thumbnail":   thumb,
                    "descripcion": desc,
                    "views":       plays,
                })
    return resultado[:5]  # máximo 5 videos por tendencia
