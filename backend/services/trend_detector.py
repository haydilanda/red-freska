import json
import re
from typing import List, Optional
import anthropic

DETECTOR_PROMPT = """Eres un analista de inteligencia cultural especializado en el mercado peruano, con foco en Lima.

Se te proporcionan datos enriquecidos de videos virales de TikTok Perú:
- Métricas: views, likes, comentarios, shares (shares = distribución activa, señal más fuerte)
- Fecha de publicación de cada video
- Tier del creador (mega-influencer, macro-creator, micro-creator, usuario-común)
- Sonido/música si aplica

Tu tarea: identificar entre 8 y 12 TENDENCIAS CULTURALES relevantes para marcas de food & beverage en Lima.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILTRO DE EXCLUSIÓN — NO incluyas tendencias sobre:
✗ Noticias políticas o electorales
✗ Desastres naturales, sismos, emergencias
✗ Crimen, inseguridad, protestas
✗ Deporte puro (resultados de partidos, fichajes)
✗ Farándula sin conexión con cultura de consumo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTRO DE INCLUSIÓN — Prioriza tendencias sobre:
✓ Momentos de consumo o reunión (familia, amigos, antojo)
✓ Humor / memes que la gente comparte masivamente
✓ Identidad peruana / orgullo local (cuando se traduce en comportamiento de consumo)
✓ Música o sonidos virales que definen un momento cultural
✓ Lifestyle urbano limeño (transporte, trabajo, ocio)
✓ Comida, bebidas, delivery, experiencias gastronómicas
✓ Tendencias de contenido (bailes, formatos, challenges) usables por marcas

SEÑALES DE TENDENCIA REAL (vs ruido):
- Shares altos (≥ 5% de likes) = se distribuyó activamente → tendencia fuerte
- Comentarios altos = generó respuesta emocional → conexión real
- Múltiples videos independientes sobre el mismo tema = tendencia orgánica
- Creadores pequeños replicando lo de uno grande = llegó al mainstream
- 💰 ANUNCIO PAGADO = una marca ya invirtió dinero en esto → señal de que funciona comercialmente
  Si ves el mismo tema en anuncios pagados Y contenido orgánico → relevancia_food muy alta (4-5)
  Si solo aparece en anuncios → puede ser tendencia emergente que las marcas detectaron antes que el público

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAMPOS REQUERIDOS por tendencia:

- nombre: título corto y memorable (máx 5 palabras, como si fuera un titular de campaña)
- fuente: siempre "TikTok"
- categoria: elige UNA →
    Humor/meme | Orgullo local | Música/baile | Lifestyle urbano |
    Familia/reunión | Gastronomía | Challenge/formato | Cultura pop | Otro
- descripcion: 2-3 oraciones concretas. Explica:
    (1) qué está pasando exactamente en los videos,
    (2) qué emoción genera en el público peruano,
    (3) por qué es una oportunidad para marcas de food (sin mencionar marcas específicas)
- momentum: estado actual de la tendencia →
    "emergente" (poca data pero creciendo rápido)
    "pico" (máxima viralidad ahora mismo)
    "establecida" (ya conocida, ventana de activación aún abierta)
- relevancia_food: del 1 al 5, qué tan directamente conecta con food/bebidas/momentos de consumo
    5 = es directamente sobre comida o un momento de consumo claro
    3 = conexión moderada, requiere ángulo creativo
    1 = conexión forzada, solo marcas muy arriesgadas podrían usarla
- fecha: fecha de hoy en formato YYYY-MM-DD
- video_indices: lista de 2 a 5 números enteros indicando qué videos (por su número [VIDEO_N])
  son los más representativos de esta tendencia. Ej: [3, 7, 12]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANTE: Ordena las tendencias de mayor a menor relevancia_food.
Si dos tendencias son sobre lo mismo con distinto nombre, elige la que tiene más señal y descarta la otra.

Responde SOLO con JSON válido, sin texto extra:
{
  "tendencias": [
    {
      "nombre": "...",
      "fuente": "TikTok",
      "categoria": "...",
      "descripcion": "...",
      "momentum": "emergente|pico|establecida",
      "relevancia_food": 1-5,
      "fecha": "YYYY-MM-DD",
      "video_indices": [1, 4, 9]
    }
  ]
}"""


def detectar_tendencias(
    contenido_tiktok: str,
    api_key: str,
    fecha_hoy: str,
    tendencias_existentes: Optional[List[str]] = None,
) -> list[dict]:
    """
    Usa Claude para convertir datos enriquecidos de TikTok en tendencias estructuradas.

    Args:
        contenido_tiktok: texto formateado de videos
        api_key: clave Anthropic
        fecha_hoy: fecha actual ISO
        tendencias_existentes: nombres de tendencias ya en BD para evitar duplicados
    """
    client = anthropic.Anthropic(api_key=api_key)

    contexto_existentes = ""
    if tendencias_existentes:
        lista = "\n".join(f"- {n}" for n in tendencias_existentes[:50])
        contexto_existentes = (
            f"\n\nTENDENCIAS YA REGISTRADAS EN LA BASE DE DATOS (no repitas estas ni variantes muy similares):\n"
            f"{lista}\n"
        )

    mensaje = (
        f"Fecha de hoy: {fecha_hoy}"
        f"{contexto_existentes}"
        f"\n\nDatos de TikTok Perú (ordenados por engagement):\n\n{contenido_tiktok}"
    )

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=3000,
        system=DETECTOR_PROMPT,
        messages=[{"role": "user", "content": mensaje}],
    )

    raw = response.content[0].text.strip()

    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group(0)

    data = json.loads(raw)
    tendencias = data.get("tendencias", [])
    print(f"[Detector] Claude identificó {len(tendencias)} tendencias")

    # Log básico para debugging
    for t in tendencias:
        print(
            f"  [{t.get('momentum','?'):12}] "
            f"[food:{t.get('relevancia_food','?')}] "
            f"{t['nombre']}"
        )

    return tendencias
