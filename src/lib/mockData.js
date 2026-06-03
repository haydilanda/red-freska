export const MARCAS = {
  norkys: {
    id: 'norkys',
    nombre: 'Norkys',
    publico: 'Familia popular, NSE C/D, 25-50 años',
    territorio: 'Peruanidad, celebración familiar, orgullo local',
    tono: 'Cálido, directo, festivo. Nunca irónico ni elitista',
    palanca: 'Orgullo peruano, la reunión familiar',
    color: '#E8383D',
  },
  papajohns: {
    id: 'papajohns',
    nombre: "Papa John's",
    publico: 'Jóvenes digitales, NSE B/C, 18-30 años',
    territorio: 'Cultura pop, gaming, noche, entretenimiento',
    tono: 'Irreverente, joven, bold. Puede ser meme-friendly',
    palanca: 'Pertenencia a tribu, el grupo, la sesión',
    color: '#006B45',
  },
  starbucks: {
    id: 'starbucks',
    nombre: 'Starbucks',
    publico: 'Adultos aspiracionales, NSE A/B, 22-35 años',
    territorio: 'Bienestar, lifestyle, música, estética, identidad',
    tono: 'Aspiracional, calmado, moderno. Nunca ruidoso',
    palanca: 'Identidad de estilo de vida',
    color: '#00704A',
  },
}

export const TENDENCIAS = [
  {
    id: '1',
    nombre: 'Fiestas Patrias en familia',
    fuente: 'TikTok Peru',
    fecha: '2025-06-10',
    categoria: 'Estacionalidad',
    descripcion:
      'Contenido masivo sobre celebraciones de Fiestas Patrias con la familia, comida típica y decoración patriótica. Dominado por familias de NSE C/D con alto engagement en recetas, bailes y reuniones.',
    estado: 'publicada',
  },
  {
    id: '2',
    nombre: 'Silhouette Challenge 2.0',
    fuente: 'TikTok / Instagram',
    fecha: '2025-06-08',
    categoria: 'Viral',
    descripcion:
      'Reto visual donde creadores muestran transformaciones de look o producto usando filtro de silueta. Alta viralidad entre jóvenes 18-28 años, especialmente en Lima.',
    estado: 'publicada',
  },
  {
    id: '3',
    nombre: 'Café de especialidad en casa',
    fuente: 'Instagram / YouTube',
    fecha: '2025-06-05',
    categoria: 'Lifestyle',
    descripcion:
      'Tendencia de preparar café de especialidad en casa: V60, AeroPress, cold brew. Contenido aspiracional, estética minimalista, audiencia NSE A/B urbana.',
    estado: 'publicada',
  },
  {
    id: '4',
    nombre: 'Deinfluencing de fast food',
    fuente: 'TikTok',
    fecha: '2025-06-03',
    categoria: 'Contratendencia',
    descripcion:
      'Creadores compartiendo por qué dejaron de comer en cadenas internacionales y prefieren locales independientes. Narrativa de autenticidad y calidad real.',
    estado: 'revisar',
  },
  {
    id: '5',
    nombre: 'Gaming nights con delivery',
    fuente: 'Twitch / Discord',
    fecha: '2025-06-01',
    categoria: 'Comportamiento',
    descripcion:
      'Comunidades gamer que organizan noches de juego y hacen pedidos grupales de delivery. Alta frecuencia en fines de semana, NSE B/C, 18-30 años.',
    estado: 'publicada',
  },
  {
    id: '6',
    nombre: 'Wellness matutino',
    fuente: 'Instagram / Pinterest',
    fecha: '2025-05-28',
    categoria: 'Lifestyle',
    descripcion:
      'Rutinas de mañana que incluyen journaling, meditación, smoothies y café. Estética calmada, aspiracional. Audiencia adulta joven urbana NSE A/B.',
    estado: 'publicada',
  },
]

export const SCORES = {
  norkys: [
    {
      tendencia_id: '1',
      score_publico: 9,
      score_territorio: 10,
      score_tono: 9,
      score_final: 94.5,
      activar: true,
      razon:
        'Fiestas Patrias es el territorio natural de Norkys: familia, peruanidad y celebración en NSE C/D encajan perfectamente con su identidad.',
      brief: {
        angulo: 'La mesa familiar más peruana del 28. Norkys hace la reunión más grande del año.',
        formato: 'Video UGC + stories de "¿Con quién festejas el 28?" + reels de mesa servida',
        cta: 'Arma tu mesa con Norkys este 28 — Pide ahora y recibe a tiempo',
      },
    },
    {
      tendencia_id: '2',
      score_publico: 4,
      score_territorio: 3,
      score_tono: 4,
      score_final: 36.5,
      activar: false,
      razon:
        'El Silhouette Challenge apunta a jóvenes digitales, un perfil fuera del núcleo de Norkys, y el tono visual no encaja con su identidad cálida y familiar.',
      brief: null,
    },
    {
      tendencia_id: '3',
      score_publico: 3,
      score_territorio: 2,
      score_tono: 2,
      score_final: 24.0,
      activar: false,
      razon:
        'El café de especialidad es aspiracional NSE A/B, territorio opuesto al público familiar y popular de Norkys.',
      brief: null,
    },
    {
      tendencia_id: '4',
      score_publico: 7,
      score_territorio: 8,
      score_tono: 7,
      score_final: 74.5,
      activar: true,
      razon:
        'El deinfluencing favorece a marcas locales auténticas como Norkys frente a cadenas internacionales, lo cual puede usarse como palanca de orgullo peruano.',
      brief: {
        angulo: 'No somos fast food, somos comida de verdad. Somos Norkys.',
        formato: 'Video testimonial de clientes reales + post comparativo "hecho en Perú vs. importado"',
        cta: 'Prueba lo real. Pide Norkys hoy.',
      },
    },
    {
      tendencia_id: '5',
      score_publico: 5,
      score_territorio: 4,
      score_tono: 5,
      score_final: 46.5,
      activar: false,
      razon:
        'Gaming nights es un comportamiento alejado del territorio familiar de Norkys y su público objetivo habitual.',
      brief: null,
    },
    {
      tendencia_id: '6',
      score_publico: 2,
      score_territorio: 2,
      score_tono: 2,
      score_final: 20.0,
      activar: false,
      razon:
        'Wellness matutino es una tendencia aspiracional NSE A/B completamente ajena al territorio de Norkys.',
      brief: null,
    },
  ],
  papajohns: [
    {
      tendencia_id: '1',
      score_publico: 5,
      score_territorio: 4,
      score_tono: 5,
      score_final: 46.5,
      activar: false,
      razon:
        'Fiestas Patrias es territorio de marcas locales, no encaja con el posicionamiento pop-digital de Papa Johns.',
      brief: null,
    },
    {
      tendencia_id: '2',
      score_publico: 9,
      score_territorio: 8,
      score_tono: 9,
      score_final: 86.0,
      activar: true,
      razon:
        'El Silhouette Challenge apunta directo al público joven-digital de Papa Johns y el tono bold y visual encaja perfectamente.',
      brief: {
        angulo: 'La pizza que te transforma. ¿Listo para el challenge?',
        formato: 'Reto de TikTok con filtro de silueta + caja de pizza como prop estrella',
        cta: 'Muéstranos tu #PapaJohnsSilhouette y gana tu orden gratis',
      },
    },
    {
      tendencia_id: '3',
      score_publico: 5,
      score_territorio: 4,
      score_tono: 4,
      score_final: 44.5,
      activar: false,
      razon:
        'Café de especialidad se aleja del territorio entretenimiento-noche de Papa Johns.',
      brief: null,
    },
    {
      tendencia_id: '4',
      score_publico: 6,
      score_territorio: 5,
      score_tono: 7,
      score_final: 57.5,
      activar: false,
      razon:
        'El deinfluencing puede usarse tangencialmente pero es arriesgado para una cadena internacional como Papa Johns.',
      brief: null,
    },
    {
      tendencia_id: '5',
      score_publico: 10,
      score_territorio: 9,
      score_tono: 10,
      score_final: 95.5,
      activar: true,
      razon:
        'Gaming nights es el escenario perfecto de Papa Johns: jóvenes digitales, grupo, sesión y delivery nocturno son exactamente su territorio.',
      brief: {
        angulo: 'La sesión de gaming no está completa sin Papa Johns. Level up tu orden.',
        formato: 'Contenido en Twitch/Discord + pack "Gaming Bundle" + reels de grupo jugando con pizza',
        cta: 'Ordena el Gaming Bundle — Llega en 30 min o la próxima es gratis',
      },
    },
    {
      tendencia_id: '6',
      score_publico: 4,
      score_territorio: 3,
      score_tono: 3,
      score_final: 34.5,
      activar: false,
      razon:
        'Wellness matutino es incompatible con el posicionamiento nocturno y bold de Papa Johns.',
      brief: null,
    },
  ],
  starbucks: [
    {
      tendencia_id: '1',
      score_publico: 3,
      score_territorio: 2,
      score_tono: 2,
      score_final: 24.0,
      activar: false,
      razon:
        'Fiestas Patrias en familia es territorio ajeno al posicionamiento aspiracional e individual de Starbucks.',
      brief: null,
    },
    {
      tendencia_id: '2',
      score_publico: 6,
      score_territorio: 5,
      score_tono: 4,
      score_final: 51.5,
      activar: false,
      razon:
        'El Silhouette Challenge tiene potencial visual pero el tono bold no encaja del todo con la estética calmada de Starbucks.',
      brief: null,
    },
    {
      tendencia_id: '3',
      score_publico: 10,
      score_territorio: 9,
      score_tono: 10,
      score_final: 96.5,
      activar: true,
      razon:
        'Café de especialidad en casa es el territorio exacto de Starbucks: audiencia aspiracional, estética minimalista e identidad de lifestyle.',
      brief: {
        angulo: 'Tu ritual de mañana, elevado. El café de especialidad que ya conoces, ahora en casa.',
        formato: 'Reels de preparación V60/cold brew con productos Starbucks + stories "Tu morning ritual"',
        cta: 'Lleva el ritual a casa — Encuentra nuestros granos en tienda o app',
      },
    },
    {
      tendencia_id: '4',
      score_publico: 5,
      score_territorio: 4,
      score_tono: 4,
      score_final: 44.5,
      activar: false,
      razon:
        'El deinfluencing puede volverse en contra de Starbucks como cadena internacional, mejor evitar este territorio.',
      brief: null,
    },
    {
      tendencia_id: '5',
      score_publico: 3,
      score_territorio: 2,
      score_tono: 2,
      score_final: 24.0,
      activar: false,
      razon:
        'Gaming nights es incompatible con el perfil aspiracional y la estética calmada de Starbucks.',
      brief: null,
    },
    {
      tendencia_id: '6',
      score_publico: 9,
      score_territorio: 10,
      score_tono: 9,
      score_final: 94.5,
      activar: true,
      razon:
        'Wellness matutino es el territorio natural de Starbucks: bienestar, rutina, identidad y estética aspiracional en NSE A/B.',
      brief: {
        angulo: 'El bienestar empieza con tu primer sorbo. Starbucks, parte de tu ritual.',
        formato: 'Contenido de morning routine en IG/Pinterest + collab con wellness creators',
        cta: 'Empieza tu día bien — Descarga la app y personaliza tu orden',
      },
    },
  ],
}

export const EVOLUCION_SCORE = {
  norkys: [
    { mes: 'Ene', score: 62 },
    { mes: 'Feb', score: 58 },
    { mes: 'Mar', score: 71 },
    { mes: 'Abr', score: 68 },
    { mes: 'May', score: 74 },
    { mes: 'Jun', score: 81 },
  ],
  papajohns: [
    { mes: 'Ene', score: 55 },
    { mes: 'Feb', score: 63 },
    { mes: 'Mar', score: 60 },
    { mes: 'Abr', score: 72 },
    { mes: 'May', score: 78 },
    { mes: 'Jun', score: 85 },
  ],
  starbucks: [
    { mes: 'Ene', score: 70 },
    { mes: 'Feb', score: 66 },
    { mes: 'Mar', score: 74 },
    { mes: 'Abr', score: 80 },
    { mes: 'May', score: 77 },
    { mes: 'Jun', score: 89 },
  ],
}

export const USUARIOS = [
  { email: 'admin@redfreska.com', password: '1234', rol: 'admin', marca_id: null },
  { email: 'norkys@redfreska.com', password: '1234', rol: 'cliente', marca_id: 'norkys' },
  { email: 'papajohns@redfreska.com', password: '1234', rol: 'cliente', marca_id: 'papajohns' },
  { email: 'starbucks@redfreska.com', password: '1234', rol: 'cliente', marca_id: 'starbucks' },
]

export function getScoreEstado(score) {
  if (score >= 65) return { label: 'Activar', color: 'green' }
  if (score >= 50) return { label: 'Evaluar', color: 'yellow' }
  return { label: 'No activar', color: 'red' }
}

export function getScoresMarca(marcaId) {
  return SCORES[marcaId] || []
}

export function getTendenciaById(id) {
  return TENDENCIAS.find((t) => t.id === id)
}

export function getScoreByTendencia(marcaId, tendenciaId) {
  return (SCORES[marcaId] || []).find((s) => s.tendencia_id === tendenciaId)
}
