# Historial de Requerimientos Cumplidos: Módulo de Press de Banca Plano (Axis)

Este documento detalla y valida científicamente todos los requerimientos técnicos, anatómicos y de interactividad que ya han sido completamente implementados e integrados en la aplicación **Axis**.

---

## 1. Infraestructura y Configuración Inicial
* **[CUMPLIDO] Migración y Reestructuración de Directorios:** Toda la base de código fue migrada a la subcarpeta `/axis` dentro de `/Liss`, la cual opera ahora como la nueva raíz del proyecto.
* **[CUMPLIDO] Repositorio Git:** Se inicializó un repositorio Git local (`git init`) en el directorio `/axis` para la gestión y control de versiones del código.
* **[CUMPLIDO] Next.js y Zustand Store:** Configurado un store reactivo con Zustand (`useSimulationStore.ts`) que centraliza el progreso (0 a 100%), velocidad (1x, 0.5x, 0.25x), estado de reproducción (`isPlaying`) y carga de peso (`weight`), sincronizándose sin retraso entre los distintos paneles.

---

## 2. Fidelidad Cinemática y Motor Biomecánico
* **[CUMPLIDO] Trayectoria Real en J-Curve:**
  * Se implementó una parábola J-curve exacta en `biomechanics.ts`.
  * La barra inicia alineada verticalmente sobre el hombro a una altura de **Y = 140 px** (fase de Bloqueo / Lockout) y describe una ligera curva descendente hasta posarse en la parte baja del esternón a una altura de **Y = 290 px** (fase de Contacto Esternal).
* **[CUMPLIDO] Cinemática Inversa (IK) Acotada:**
  * Se recalibraron las longitudes de los segmentos para cumplir con las proporciones humanas reales: brazo superior (`L_ARM = 95 px`) y antebrazo (`L_FOREARM = 85 px`).
  * **Optimización de Codos:** Esto evita que los codos bajen de forma antinatural hasta la cintura, asegurando que se mantengan doblados a la mitad del pecho ($Y = 375\text{ px}$ en el punto de flexión máxima), respetando la anatomía clínica estándar del ejercicio.

---

## 3. Interactividad Avanzada y Selección de Carga
* **[CUMPLIDO] Deslizador Interactiva Directo (SVG Drag/Touch Scrubbing):**
  * El usuario puede realizar **arrastre directo del ratón o control táctil sobre el lienzo SVG** para avanzar o retroceder la simulación manualmente.
  * El arrastre detecta el movimiento vertical, actualiza el progreso instantáneamente y pausa de forma automática la reproducción para permitir una inspección milimétrica de las articulaciones.
* **[CUMPLIDO] Selector Dinámico de Cargas:**
  * Panel de control interactivo para seleccionar la carga: **20 kg (barra vacía), 60 kg, 80 kg, 100 kg, 120 kg**.
* **[CUMPLIDO] Pilas de Discos Olímpicos SVG:**
  * La manga de la barra carga dinámicamente discos de colores olímpicos reales según el peso seleccionado (Rojo para 20/25 kg, Azul para 15/10 kg, Verde para 5 kg, etc.).
  * El extremo de la barra detalla el peso de forma gráfica (ej. `100k`).

---

## 4. Motor de Física Real y Cálculos de Torque
* **[CUMPLIDO] Fuerza Gravitacional ($F_g$):**
  * La masa seleccionada se traduce automáticamente a Newtons ($Fg = \text{masa} \times 9.81\text{ N/kg}$). Una carga de $100\text{ kg}$ genera exactamente un vector descendente de $981\text{ N}$.
  * El vector de fuerza de gravedad (flecha roja) **escala en longitud, grosor y destello (glow)** proporcionalmente al peso cargado.
* **[CUMPLIDO] Brazos de Momento Reales:**
  * El motor calcula las distancias horizontales (en cm) desde la línea de acción de la fuerza hasta el Hombro y el Codo.
  * Estos brazos se proyectan de forma gráfica en el SVG como líneas de cota con etiquetas dinámicas en tiempo real.
* **[CUMPLIDO] Torques Articulares Netos ($N\cdot m$):**
  * Se calculan los momentos flexores netos de las articulaciones multiplicando la fuerza de gravedad por los brazos de momento en metros ($Torque = F_g \times [MomentoArm / 100]$).
  * El panel muestra en tiempo real los valores exactos de torque para el Hombro y el Codo en $N\cdot m$, sirviendo como indicador directo del esfuerzo exigido a los extensores de hombro (Pectoral/Deltoides) y codo (Tríceps).
* **[CUMPLIDO] Tensión Muscular Proporcional al Peso:**
  * El motor de activación escala la tensión muscular de acuerdo a la carga aplicada ($loadFactor = \text{peso} / 60\text{ kg}$), aumentando las demandas de activación para el Pectoral, Deltoides y Tríceps según el esfuerzo real.

---

## 5. Diseño Visual y Renderizado Anatómico SVG
* **[CUMPLIDO] Color de Contraste Gris Pizarra Técnico (`#1c1c21`):**
  * Se sustituyó el fondo negro absoluto de globals.css por la paleta pizarra, mejorando el contraste visual, disminuyendo el brillo y optimizando el cansancio ocular durante sesiones prolongadas.
* **[CUMPLIDO] Detalle Anatómico Superior (Marioneta 2D):**
  * **Huesos Realistas:** El Húmero, Radio y Cúbito están modelados con siluetas óseas, incluyendo sus extremos ensanchados (epicóndilo/olecranon) y una línea interna de canal medular.
  * **Separación de Antebrazo:** El antebrazo dibuja los dos huesos paralelos reales (Radio y Cúbito) rotando sincronizados con la cinemática inversa.
  * **Caja Torácica y Vértebras:** Se añadieron 6 costillas curvadas tridimensionales y 13 vértebras en la columna para brindar una referencia esquelética óptima en la banca.
  * **Musculatura Dinámica:** El Pectoral Mayor, Deltoides Anterior y Tríceps Braquial se representan como masas musculares cuyos colores varían suavemente de azul (reposo) a rojo (esfuerzo máximo) y sus fibras internas aumentan de opacidad reactivamente según su porcentaje de activación.
* **[CUMPLIDO] Corrección del Compilador Turbopack:**
  * Se extrajeron todas las operaciones de división e interpolación fuera del JSX del SVG en variables locales del componente para prevenir que el compilador de Next.js (Turbopack) detecte erróneamente barras de operaciones matemáticas como etiquetas de cierre HTML/JSX.
