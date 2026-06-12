import json
import re
import anthropic
from typing import Optional


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    # Extraer JSON de bloques markdown si Claude los incluye
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group(0)
    if not raw:
        raise ValueError("Respuesta vacía de Claude")
    return json.loads(raw)


def _construir_perfil_marca(marca_nombre: str, marca_perfil: dict) -> str:
    """
    Construye el bloque de contexto de marca que se envía a Claude.
    Si existe voz_marca configurada, enriquece el perfil con datos de
    comunicación digital específicos de esa marca.
    """
    voz = marca_perfil.get("voz_marca") or {}

    lineas = [f"Marca: {marca_nombre}"]
    lineas.append("\nPerfil base:")
    lineas.append(f"- Público objetivo: {marca_perfil.get('publico', '')}")
    lineas.append(f"- Territorio cultural: {marca_perfil.get('territorio', '')}")
    lineas.append(f"- Tono base: {marca_perfil.get('tono', '')}")
    lineas.append(f"- Palanca emocional: {marca_perfil.get('palanca', '')}")

    if voz:
        lineas.append("\nVoz de marca digital (cómo se expresa en redes sociales):")
        if voz.get("personalidad"):
            lineas.append(f"- Personalidad: {voz['personalidad']}")
        if voz.get("estilo_escritura"):
            estilos = {"formal": "Formal y cuidado", "informal": "Informal y cercano", "mixto": "Mixto según contexto"}
            lineas.append(f"- Estilo de escritura: {estilos.get(voz['estilo_escritura'], voz['estilo_escritura'])}")
        if voz.get("nivel_humor"):
            humores = {
                "ninguno": "No usa humor",
                "sutil": "Humor sutil y ocasional",
                "frecuente": "Humor frecuente",
                "es_su_sello": "El humor ES su sello diferenciador",
            }
            lineas.append(f"- Nivel de humor: {humores.get(voz['nivel_humor'], voz['nivel_humor'])}")
        if voz.get("usa_emojis") is not None:
            lineas.append(f"- Emojis: {'Sí los usa habitualmente' if voz['usa_emojis'] else 'No usa emojis'}")
        if voz.get("plataformas_activas"):
            lineas.append(f"- Plataformas activas: {', '.join(voz['plataformas_activas'])}")
        if voz.get("pilares_contenido"):
            lineas.append(f"- Pilares de contenido: {', '.join(voz['pilares_contenido'])}")
        if voz.get("temas_prohibidos"):
            lineas.append(f"- Temas que NUNCA toca: {', '.join(voz['temas_prohibidos'])}")
        if voz.get("audiencia_nsea"):
            lineas.append(f"- NSE objetivo: {voz['audiencia_nsea']}")
        if voz.get("momento_consumo"):
            lineas.append(f"- Momentos clave de consumo: {', '.join(voz['momento_consumo'])}")

    return "\n".join(lineas)


SYSTEM_PROMPT = """Eres un sistema de evaluación cultural para marcas de food en Lima, Perú.

Tu tarea: recibir una tendencia cultural y evaluarla contra el perfil de identidad de una marca. Devuelves un score numérico por cada dimensión y un score final ponderado.

Reglas de scoring — USA TODO EL RANGO:
- Puntúa cada dimensión del 0 al 10 (entero)
- 0 = nulo encaje | 3 = encaje débil | 5 = encaje moderado | 7 = buen encaje | 9-10 = encaje fuerte y evidente
- SÉ PRECISO Y DIFERENCIADO: si la tendencia conecta bien con la marca, refleja eso con un 7, 8 o 9. No uses 5 como respuesta por defecto.
- Penaliza fuerte (0-3) solo cuando hay conflicto real de valores, NSE incompatible o territorio opuesto.
- Si la marca tiene "Voz de marca digital" configurada, úsala para evaluar Tono con precisión.

Dimensiones y pesos:
- Público (40%): ¿El perfil demográfico y NSE de la marca consume o participa de esta tendencia?
  → Pregúntate: ¿las personas que siguen a esta marca verían este contenido y lo compartirían?
- Territorio (35%): ¿La tendencia ocurre en el espacio cultural que esta marca habita?
  → Pregúntate: ¿tiene sentido que esta marca comente o se sume a esta conversación?
- Tono (25%): ¿El lenguaje, humor y formato de la tendencia es compatible con cómo habla la marca?
  → Pregúntate: ¿podría la marca publicar contenido sobre esto sin que se vea forzado?

Fórmula: score_final = round((publico×40 + territorio×35 + tono×25) / 10, 1)

Formato de respuesta: SOLO JSON, sin texto adicional.
{
  "marca": "nombre",
  "tendencia": "nombre",
  "scores": { "publico": 0-10, "territorio": 0-10, "tono": 0-10 },
  "score_final": 0.0-100.0,
  "activar": true/false,
  "razon": "1 sola oración explicando el score — menciona específicamente qué aspecto de la tendencia conecta o no con el perfil de la marca"
}

activar = true solo si score_final >= 65."""

BRIEF_PROMPT = """Eres un estratega creativo senior de marcas de food en Lima, Perú.

Dado el nombre de la tendencia, la marca y su perfil de identidad (incluyendo su voz digital si está disponible), genera un brief ejecutable y visualmente estructurado para el equipo de marketing.

IMPORTANTE: El brief debe respetar el estilo de comunicación propio de la marca.
- Si usa humor como sello → el ángulo debe ser humorístico
- Si es formal → el tono del brief debe serlo
- Prioriza las plataformas activas de la marca si están configuradas
- Conecta la tendencia con los pilares de contenido de la marca

Responde SOLO en JSON con esta estructura exacta. No agregues texto fuera del JSON:
{
  "angulo": {
    "titular": "Frase corta e impactante (máx 6 palabras) que resume el concepto de campaña, en el tono de la marca",
    "descripcion": "2-3 oraciones explicando el ángulo narrativo, cómo la marca se inserta en la tendencia y qué emoción activa en el público"
  },
  "formato": [
    {"plataforma": "TikTok", "tipo": "descripción breve del formato o tipo de contenido"},
    {"plataforma": "Instagram Reels", "tipo": "descripción breve"},
    {"plataforma": "Stories", "tipo": "descripción breve"}
  ],
  "cta": {
    "titulo": "El call to action principal en 3-6 palabras, en el tono de la marca",
    "descripcion": "1-2 oraciones explicando el CTA y cómo se ejecuta (delivery, promo, hashtag, etc.)",
    "pasos": ["Acción 1 en imperativo corto", "Acción 2", "Acción 3"]
  }
}

Notas:
- formato: entre 3 y 5 plataformas. Plataformas válidas: TikTok, Instagram Reels, Stories, Facebook, YouTube Shorts, Memes, WhatsApp, Twitter/X
- cta.pasos: exactamente 3 pasos, cortos y en imperativo (ej: "Pide tu combo", "Comparte tu foto", "Celebra en familia")
- Sin texto extra fuera del JSON."""


def score_tendencia(
    marca_nombre: str,
    marca_perfil: dict,
    tendencia_nombre: str,
    tendencia_descripcion: str,
    api_key: str,
) -> dict:
    client = anthropic.Anthropic(api_key=api_key)

    perfil_texto = _construir_perfil_marca(marca_nombre, marca_perfil)
    user_content = f"""{perfil_texto}

Tendencia a evaluar: {tendencia_nombre}
Descripción: {tendencia_descripcion}"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = message.content[0].text if message.content else ""
    print(f"[LLM score] stop_reason={message.stop_reason} raw={repr(raw[:300])}")
    return _parse_json(raw)


def generar_brief(
    marca_nombre: str,
    marca_perfil: dict,
    tendencia_nombre: str,
    razon: str,
    api_key: str,
) -> dict:
    client = anthropic.Anthropic(api_key=api_key)

    perfil_texto = _construir_perfil_marca(marca_nombre, marca_perfil)
    user_content = f"""{perfil_texto}

Tendencia: {tendencia_nombre}
Razón del encaje: {razon}

Genera el brief ejecutable respetando la voz de la marca."""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        system=BRIEF_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = message.content[0].text if message.content else ""
    print(f"[LLM brief] stop_reason={message.stop_reason} raw={repr(raw[:300])}")
    return _parse_json(raw)
