# Documento de Requerimientos y Arquitectura: Simulador Interactivo de Biomecánica Aplicada

## 1. Resumen del Proyecto y Objetivos
El proyecto consiste en el desarrollo de una aplicación web interactiva para la enseñanza de la anatomía funcional y biomecánica deportiva. La herramienta está dirigida al sector educativo (B2E) y a profesionales de la salud/deporte (entrenadores, kinesiólogos) para facilitar la explicación técnica de los ejercicios a pacientes y alumnos.

A diferencia de los atlas estáticos, esta app optimiza la carga cognitiva priorizando el análisis dinámico de gestos técnicos, vectores de fuerza y curvas de tensión muscular en tiempo real. 

### 1.1 Casos de Uso Principales
* **Educación Universitaria:** Apoyo docente para carreras de ciencias del deporte.
* **Justificación de Entrenamiento:** Demostrar visualmente a un cliente por qué un ejercicio específico (ej. Press de Banca) fortalece ciertos músculos.
* **Diagnóstico y Prevención:** Identificar grupos musculares activos durante puntos de dolor reportados por usuarios.
* **Análisis Cinemático:** Visualización en "cámara lenta" de ángulos articulares y niveles de activación.

## 2. Especificaciones Técnicas (Stack Recomendado)
* **Framework:** Next.js (App Router).
* **Estilos:** Tailwind CSS (garantizando un Dark Mode técnico y limpio).
* **Manejo de Estado:** Zustand o React Context para sincronizar globalmente el deslizador de progreso con la rotación articular y la interfaz de colores.

## 3. Requerimientos del Módulo Base: Press de Banca Plano (MVP V3)
El primer módulo se enfoca en el Press de Banca visto desde el plano sagital.

### 3.1 Fidelidad Cinemática
* **Trayectoria en J:** El motor debe simular el recorrido real de la barra olímpica. Debe describir una ligera parábola, iniciando alineada sobre el eje glenohumeral (bloqueo) y finalizando con contacto exacto sobre la zona baja del esternón.
* **Control de Fase:** Se utilizará un `input type="range"` (deslizador) para controlar el progreso del movimiento excéntrico y concéntrico.

### 3.2 Motor de Cálculo de Tensión
* **Brazo de Momento:** La lógica debe calcular la distancia horizontal entre la línea de acción de la carga y los ejes de rotación (hombro y codo).
* **Actualización en Tiempo Real:** Este cálculo define la ventaja mecánica y distribuye los porcentajes de tensión.

### 3.3 Matriz de Activación Muscular
| Grupo Muscular | Fase Excéntrica (Descenso a Pecho) | Fase Concéntrica (Bloqueo) | Interfaz Visual (RGB/Opacidad) |
| :--- | :--- | :--- | :--- |
| **Pectoral Mayor** | Incremento de tensión hasta el 100% | Disminución progresiva | Pasa de Azul (reposo) a Rojo Intenso al 100% |
| **Tríceps Braquial** | Tensión moderada de control (35%) | Incremento crítico hasta 100% | Brillo máximo en 0% (Bloqueo activo) |
| **Deltoides Anterior** | Tensión sinérgica progresiva (hasta 95%) | Asistencia en flexión | Iluminación intermedia acompañando al pectoral |

## 4. Requerimientos de Assets Visuales: Renderizado Anatómico SVG
El sistema debe utilizar gráficos vectoriales interactivos (Marioneta 2D) en lugar de primitivas HTML (divs) para el modelo biomecánico.

### 4.1 Arquitectura del SVG Interactivo
* **Integración de Componentes:** Tratar los archivos `.svg` como componentes de React (ej. usando `@svgr/webpack` o importación directa en Next.js).
* **Agrupación y Ejes de Rotación:** Estructurar el código esperando SVGs con etiquetas `<g>` (grupos). Definir los atributos `transform-origin` con precisión dentro del SVG (ej. el centro de la cabeza del húmero para la rotación del brazo).
* **Inyección de Props (Tensión):** Los componentes SVG deben aceptar props de React (ej. `tensionPectoral`, `tensionTriceps`) y enlazarlos a las propiedades `fill`, `stroke` y `opacity` de los `<path>` correspondientes a cada músculo anatómico.
* **Transiciones Suaves:** Aplicar clases de Tailwind o CSS puro (ej. `transition-colors duration-200 ease-in-out`) a los `<path>` para suavizar el cambio de azul (reposo) a rojo (esfuerzo máximo).

## 5. Roadmap de Tareas para Agentes IA

> **Instrucción para el Agente:** Ejecuta las siguientes tareas en orden estricto. No avances a la siguiente sin haber consolidado y validado el código de la tarea actual. Mantén rigor científico en los cálculos y no inventes ángulos anatómicos.

### Tarea 1: Inicialización del Proyecto y Layout Base
* Inicializa un proyecto en Next.js con Tailwind CSS.
* Crea un layout principal estructurado en dos columnas (visión desktop).
* Aplica un diseño `Dark Mode` (#121212 de fondo) sin sobrecargar la pantalla con datos innecesarios.
* Crea los contenedores vacíos para el `Escenario Visual` y el `Panel Lateral de Tensión`.

### Tarea 2: Implementación del Motor de Estado (Zustand/Context)
* Crea un store global para manejar la fase del movimiento (valor del 0 al 100).
* Implementa el slider en un componente de controles inferiores.
* Crea las funciones utilitarias matemáticas para extrapolar el porcentaje del slider a:
    * Ángulos de rotación del hombro y codo.
    * Porcentajes de tensión muscular según la matriz de activación.

### Tarea 3: Construcción del Escenario Cinemático 2D (con SVG)
* Crea un componente `KinematicScene`.
* Diseña la estructura base integrando la lógica de componentes SVG detallada en la sección 4. Si no cuentas con los SVGs finales, utiliza formas vectoriales tipo *placeholder* (paths básicos) que cumplan la misma estructura de grupos `<g>`.
* Conecta las rotaciones (`transform: rotate()`) de las extremidades al estado global.
* **Condición:** El hombro es el eje fijo, el brazo rota hacia abajo y el antebrazo mantiene la verticalidad mediante cálculo de ángulo relativo.

### Tarea 4: Sincronización del Panel de Tensión Dinámico
* Crea el panel lateral que muestra la lista de músculos.
* Implementa la lógica que traduce los porcentajes de tensión a interpolaciones de color exactas.
* Aplica estas variaciones cromáticas tanto a las tarjetas de la interfaz gráfica como a los props de color de los componentes SVG en el escenario 2D en tiempo real.

### Tarea 5: Refinamiento de UX y Modo "Cámara Lenta"
* Añade un visualizador numérico de los ángulos articulares actuales (hombro y codo) para satisfacer requerimientos de estudio clínico.
* Implementa controles de reproducción automática (Play/Pause) con velocidad ajustable (1x, 0.5x, 0.25x) para permitir el análisis de la cinemática del ejercicio.
