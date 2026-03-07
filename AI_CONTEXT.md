PRODUCT CONTEXT – PROD MANAGER

Actuá siempre como Senior Software Architect + Senior Product Engineer.

Estás trabajando en el proyecto ProdManager, un SaaS para gestión de producción en talleres.

IMPORTANTE:
Este sistema NO es exclusivo de impresión 3D.
Es una plataforma multi-industria.

El sistema debe poder adaptarse a distintos tipos de talleres.

INDUSTRIAS SOPORTADAS

Actualmente el sistema contempla:

- Impresiones 3D
- Metalúrgica
- Carpintería
- Talleres de fabricación general

Por lo tanto:

- NO hardcodear lógica específica de impresión 3D
- NO usar iconos específicos de impresión 3D por defecto
- NO asumir que siempre existen impresoras
- TODO debe depender del tipo de negocio (businessType)

businessType posibles:

- PRINT_3D
- METALWORK
- CARPENTRY
- GENERIC_WORKSHOP

ARQUITECTURA ESPERADA

La UI y funcionalidades deben adaptarse según el negocio.

Esto afecta:

- iconos
- módulos visibles
- métricas del dashboard
- nombres de procesos
- columnas de producción
- terminología usada

Ejemplo PRINT_3D:
- impresiones
- STL
- impresoras
- filamento

Ejemplo METALWORK:
- portones
- estructuras
- corte
- soldadura
- pintura
- instalación

Ejemplo CARPENTRY:
- muebles
- corte de madera
- armado
- barnizado

PRODUCCIÓN

El sistema maneja pedidos de producción.

Cada pedido puede tener:

- items
- etapas
- progreso
- fecha de entrega
- prioridad

Las etapas deben ser configurables por industria.

Ejemplo METALWORK:
- Diseño
- Corte
- Soldadura
- Armado
- Pintura
- Instalación

Ejemplo PRINT_3D:
- Preparación STL
- Impresión
- Post-proceso
- Entrega

OBJETIVO DEL PRODUCTO

ProdManager debe ser un SaaS industrial flexible, que permita a distintos talleres gestionar:

- pedidos
- producción
- máquinas
- materiales
- clientes
- ingresos

El sistema debe sentirse profesional, escalable y performante.

REGLAS IMPORTANTES AL MODIFICAR EL SISTEMA

Cuando implementes cambios:

1. No romper funcionalidades existentes.
2. No asumir un solo tipo de negocio.
3. Usar configuraciones por industria.
4. Evitar hardcode.
5. Diseñar componentes reutilizables.
6. Mantener la arquitectura limpia.
7. Cargar en cada pantalla solo la información estrictamente necesaria.
8. Evitar llamadas a endpoints cuyos datos no se usan realmente en la UI.
9. Evitar sobre-fetching, renders innecesarios y dependencias cruzadas entre pantallas.
10. Optimizar la app para que cada vista sea rápida, predecible y fácil de mantener.

REGLAS DE PERFORMANCE Y CONSUMO DE DATOS

- Cada pantalla debe pedir solo los datos que necesita para renderizar su funcionalidad actual.
- No cargar colecciones completas si la vista solo necesita resumen, id, nombre, estado o conteos.
- No traer datos “por si acaso”.
- No hacer llamadas redundantes a endpoints ya resueltos si el dato sigue vigente.
- Reutilizar caché de forma controlada cuando aplique, sin provocar loops ni inconsistencias.
- Separar claramente datos globales de sesión de datos propios de cada pantalla.
- /me debe usarse solo para identidad, sesión, permisos y contexto base del usuario.
- /businesses debe pedirse solo cuando realmente la pantalla necesite listado o contexto de negocios.
- No convertir datos globales en dependencia de todas las pantallas si no hace falta.
- Evitar que un cambio local de una pantalla fuerce recargas globales innecesarias.
- Si una pantalla necesita más información, usar endpoints específicos por módulo en lugar de cargar datos gigantes y filtrar en el front.
- Priorizar respuestas livianas, paginadas o resumidas cuando el caso lo permita.
- Toda nueva pantalla debe analizarse también desde performance, no solo desde funcionalidad visual.

REQUISITO OBLIGATORIO DE ESTABILIDAD

No se permite ningún loop infinito de requests ni renders.

Actualmente se detectó un problema donde el frontend llama infinitamente a:

- http://localhost:3030/businesses
- http://localhost:3030/me

Cada cambio debe analizar cuidadosamente hooks, effects, providers, stores, watchers, invalidaciones de cache y lógica de sesión para evitar re-disparos automáticos.

Validar siempre en DevTools / Network que:
- no haya llamadas repetidas sin control
- cada endpoint se invoque solo la cantidad esperada
- no existan refetch automáticos innecesarios
- no haya renders encadenados por estados mal definidos

No aplicar parches superficiales.
Encontrar y corregir siempre la causa raíz.

Revisar especialmente:

- useEffect con dependencias incorrectas
- custom hooks que actualizan estado y vuelven a disparar fetch
- providers/context que recalculan valores en cada render
- invalidaciones mal configuradas en React Query / SWR
- guards, interceptors o middlewares que fuerzan re-consultas
- sincronización incorrecta entre negocio activo, usuario autenticado y navegación
- watchers o listeners que disparan fetch ante cambios irrelevantes

REQUISITO DE DISEÑO TÉCNICO POR PANTALLA

Cada pantalla debe tener responsabilidad clara y acotada.

Eso implica:

- solo consumir los endpoints necesarios
- solo renderizar los módulos necesarios
- no mezclar lógica global con lógica local sin justificación
- no depender de datos ocultos que la pantalla no usa
- no acoplar una pantalla a otra por estado compartido innecesario

ANTES de implementar cambios grandes:
ANALIZAR siempre si el cambio afecta la naturaleza multi-industria del sistema, la performance general, la estabilidad de render y el consumo eficiente de API.

## UI & UX BEST PRACTICES (DARK MODE & COMPONENTS)

Para asegurar una experiencia consistente y legible en todo momento, especialmente en **Modo Oscuro**, seguir estas reglas:

1.  **Contraste de Inputs en Foco**:
    *   Al usar componentes de `Input` o `textarea` con clases de foco personalizadas como `focus:bg-white`, es **OBLIGATORIO** incluir el equivalente para modo oscuro (ej: `dark:focus:bg-zinc-900`).
    *   Si no se especifica, el texto (que suele ser claro en dark mode) se vuelve ilegible sobre el fondo blanco que dispara el foco.

2.  **Visibilidad de Selectores (`<select>` y `<option>`)**:
    *   Los selectores nativos de HTML no siempre heredan correctamente los estilos de fondo oscuro del body en ciertos navegadores (especialmente en Linux).
    *   Es **OBLIGATORIO** aplicar clases de fondo y color de texto explícitas tanto al `<select>` como a cada `<option>` (ej: `className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"`).
    *   Esto evita el error común de "opciones invisibles" (texto blanco sobre fondo blanco) al desplegar el menú.

3.  **Consistencia de Componentes**:
    *   Priorizar el uso de los componentes de la carpeta `@/src/components/ui` y asegurarse de que sus variantes `dark:` estén correctamente implementadas.
    *   Evitar estilos "ad-hoc" que rompan con la paleta de colores `zinc` definida para el modo oscuro.