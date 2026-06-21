# FulcrumCards

## Qué es
Generador y catálogo de cards diagnósticas basadas en el framework de **El Fulcro Invisible** (García Bach & Hypatia, 2026). Cada card diagnostica una profesión, empresa o caso a través de cuatro fulcros: material, epistémico, relacional y procedencia.

## Visión
Un solo corazón (base de datos de cards) con tres superficies:
1. **Web** — catálogo público en `cards.thefulcrumproject.org`. Cada card tiene landing propia, PDF descargable tras formulario (email/newsletter).
2. **Athena** — endpoint de lectura del catálogo para curación 1-a-1 en The Agora.
3. **Redes** — cards renderizadas como imágenes para LinkedIn, X, Substack, Medium.

## Stack
- **Frontend:** Next.js 14 (App Router) + React + Tailwind
- **Backend:** API Routes de Next.js
- **Base de datos:** MongoDB Atlas — colección `fichas` en cluster existente (cluster0.7l0vgdt.mongodb.net)
- **IA:** Claude API (Sonnet 4.6) para generación de borradores de cards
- **PDF:** html2pdf o puppeteer para generación de PDFs
- **Deploy:** Vercel
- **Repo:** github.com/HypatiaAIreal/fulcrumcards (por crear)

## Diseño
Sistema visual HNV (Harmony Nexus Vitae):
- **Tipografía:** Playfair Display (800, display), IBM Plex Sans (300-400, body), JetBrains Mono (400-500, mono/labels)
- **Colores:** Navy deep (#0b1a2e), Copper (#c4875a), Cream (#f0e8db)
- **Estados:** Verified green (#5a9e6f), Assumed amber (#c4a03a), Absent red (#b05050)
- **Estética:** Ficha de espécimen — precisa, atemporal, marcas de esquina, sin decoración gratuita
- **Referencia:** ver `src/templates/card_template.html` para el template completo

## Estructura de una card (JSON)
```json
{
  "id": "003",
  "title": "El Copywriter de Marketing",
  "sector": "Profesiones de cuello blanco",
  "severity": "critical",       // "strong" | "mixed" | "warning" | "critical"
  "subtitle": "...",
  "opening": "...",              // Micro-relato que abre con persona, no concepto
  "fulcrums": {
    "material":    { "status": "absent",   "detail": "...", "crack": "...", "bar": [0,0,0,0] },
    "epistemic":   { "status": "absent",   "detail": "...", "crack": "...", "bar": [0,0,0,0] },
    "relational":  { "status": "assumed",  "detail": "...", "crack": "...", "bar": [1,0,0,0] },
    "provenance":  { "status": "absent",   "detail": "...", "crack": "...", "bar": [0,0,0,0] }
  },
  "lever": "...",                // Palanca visible
  "fulcrum": "...",              // Fulcro invisible
  "contrast": {
    "card_ref": "021",
    "text": "..."
  },
  "escape": "...",               // ¿Hay salida? (solo en cards con severity warning/critical)
  "lesson": "...",               // Lección en Playfair italic
  "references": [
    "Vol. 1, Cap. 4 — La fricción",
    "Vol. 2, Cap. 22 — La commoditización de la palanca"
  ],
  "url": "https://thefulcrumproject.org",
  "created_at": "2026-06-21",
  "lang": "es"
}
```

### Campos del bar
Array de 4 valores: 1 = verified, 0.5 = assumed, 0 = absent. Renderiza barras de color según valor.

### Severity → color del badge
- `strong`: verde (#5a9e6f) — "Cuatro fulcros verificados" o "Fulcros sólidos"
- `mixed`: ámbar (#c4a03a) — "Diagnóstico mixto"
- `warning`: ámbar-rojo — "Fulcros en riesgo"
- `critical`: rojo (#b05050) — "Fulcros en riesgo crítico"

## Funcionalidades

### Panel admin (protegido, solo Carles)
- Inyectar JSON de card manualmente (Modo curado)
- Generar borrador de card con Claude API (Modo semi-automatizado)
- Editar, previsualizar y aprobar cards
- Ver catálogo completo con filtros (sector, severity, fulcro débil)

### Landing pública por card
- URL: `cards.thefulcrumproject.org/[id]`
- Card renderizada completa
- Formulario para descargar PDF (email, optin newsletter)
- Navegación a cards relacionadas (por sector, por severity)

### API para Athena
- `GET /api/cards` — catálogo completo con metadatos
- `GET /api/cards/[id]` — card individual
- `GET /api/cards/search?sector=arte&severity=strong` — búsqueda filtrada
- `GET /api/cards/recommend?context=...` — recomendación contextual (futuro)

### Generación de imágenes para redes
- Renderizar card como imagen (PNG/JPG) recortada para cada plataforma
- LinkedIn: 1200x627 — teaser (título + diagnóstico resumido + CTA)
- X: 1200x675 — mismo formato
- Instagram: 1080x1080 — cuadrado con diagnóstico visual

## Autenticación
- Panel admin: JWT + bcrypt (como BuJo)
- API Athena: Bearer token
- Landing pública: sin auth

## Principios de desarrollo
1. **Lee el system prompt antes de generar.** El diagnóstico tiene metodología. No improvises.
2. **Abre con persona, no con concepto.** Cada card empieza con un micro-relato.
3. **El diagnóstico no condena a la persona — condena a la función.** Siempre incluir "¿Hay salida?" en cards warning/critical.
4. **Coherencia estética con el ecosistema HNV.** Las cards deben reconocerse como parte de Synapsis, BuJo, Agora.
5. **La card es el vehículo. La curación es el acto.** No automatizar la selección — Athena cura, no distribuye.

## Ecosistema relacionado
- **El Fulcro Invisible** — libro (Vol. 1 publicado, Vol. 2 en desarrollo)
- **FulcrumScan** (fulcrumscan.vercel.app) — diagnóstico individual
- **FulcrumWatch** (fulcrumwatch.vercel.app) — observatorio macro
- **The Agora** (the-agora-two.vercel.app) — Athena distribuye cards aquí
- **thefulcrumproject.org** — ecosistema central

## Cards existentes (referencia)
Ver `src/data/cards/` para las tres primeras cards ya diseñadas y validadas.
