export type Rubro = 'IMPRESION_3D' | 'METALURGICA' | 'CARPINTERIA' | 'GENERICO';

export interface Negocio {
    id: string;
    nombre: string;
    rubro: Rubro;
    moneda?: string;
    createdAt: string;
}

export interface CampoItem {
    key: string;
    label: string;
    tipo: 'text' | 'number' | 'url' | 'textarea' | 'select' | 'boolean' | 'header';
    required?: boolean;
    section?: string;
    options?: string[];
    placeholder?: string;
    className?: string;
}

export interface StatMetric {
    key: string;
    label: string;
    icon: string;
    format?: 'currency' | 'number';
}

export interface NegocioConfig {
    sidebarItems: string[];
    itemFields: CampoItem[];
    labels: {
        produccion: string;
        items: string;
        maquinas: string;
        materiales: string;
        unidadName: string;
        unidadModel: string;
    };
    icons: Record<string, string>;
    stats: StatMetric[];
    productionStages: { key: string, label: string, color: string }[];
    materialConfig: {
        namePlaceholder: string;
        brandPlaceholder: string;
        types: { key: string, label: string }[];
        units: { key: string, label: string }[];
        defaultUnit: string;
        defaultType: string;
    };
}

export function getNegocioConfig(rubro: Rubro): NegocioConfig {
    const commonStats: StatMetric[] = [
        { key: 'totalSales', label: 'Ventas Totales', icon: 'TrendingUp', format: 'currency' },
        { key: 'pendingBalance', label: 'Saldo a Cobrar', icon: 'Wallet', format: 'currency' },
    ];

    switch (rubro) {
        case 'IMPRESION_3D':
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/personal', '/produccion', '/maquinas', '/materiales', '/reportes', '/ajustes'],
                labels: {
                    produccion: 'Monitor de Impresión',
                    items: 'Modelos a Imprimir',
                    maquinas: 'Impresoras',
                    materiales: 'Filamentos',
                    unidadName: 'Nombre de Impresora',
                    unidadModel: 'Modelo / Marca'
                },
                icons: {
                    pedidos: 'Box',
                    produccion: 'Cpu',
                    maquinas: 'Printer',
                    materiales: 'Layers'
                },
                stats: [
                    ...commonStats,
                    { key: 'productionOrders', label: 'Impresiones en Proceso', icon: 'Printer', format: 'number' },
                    { key: 'activePrinters', label: 'Impresoras Activas', icon: 'Zap', format: 'number' },
                ],
                productionStages: [
                    { key: 'PENDING', label: 'Pendiente', color: 'bg-zinc-100' },
                    { key: 'IN_PROGRESS', label: 'Imprimiendo', color: 'bg-blue-500' },
                    { key: 'POST_PROCESS', label: 'Post-Proceso', color: 'bg-amber-500' },
                    { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
                ],
                materialConfig: {
                    namePlaceholder: 'Ej: PLA Negro Pro / PETG Gris',
                    brandPlaceholder: 'Ej: Grilon3 / Printalot',
                    defaultUnit: 'g',
                    defaultType: 'PLA',
                    types: [
                        { key: 'PLA', label: 'PLA' },
                        { key: 'PETG', label: 'PETG' },
                        { key: 'ABS', label: 'ABS' },
                        { key: 'TPU', label: 'TPU' },
                        { key: 'RESIN', label: 'RESINA' },
                        { key: 'LIMPIEZA', label: 'FILAMENTO LIMPIEZA' },
                    ],
                    units: [
                        { key: 'g', label: 'Gramos (g)' },
                        { key: 'kg', label: 'Kilos (kg)' },
                    ]
                },
                itemFields: [
                    { key: 'nombreProducto', label: 'Nombre producto', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Llavero de pared' },
                    { key: 'url_stl', label: 'URL STL', tipo: 'url', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'https://...' },
                    { key: 'peso_gramos', label: 'Peso estimado (g)', tipo: 'number', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. 150' },
                    { key: 'duracion_estimada_minutos', label: 'Duración (min)', tipo: 'number', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. 120' },
                ],
            };
        case 'METALURGICA':
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/personal', '/materiales', '/maquinas', '/reportes', '/ajustes'],
                labels: {
                    produccion: 'Monitor de Taller',
                    items: 'Planos y Estructuras',
                    maquinas: 'Puestos de Trabajo',
                    materiales: 'Materiales',
                    unidadName: 'Nombre del Puesto / Operario',
                    unidadModel: 'Especialidad / Equipo'
                },
                icons: {
                    pedidos: 'FileText',
                    produccion: 'Cog',
                    maquinas: 'Wrench',
                    materiales: 'Grid'
                },
                stats: [
                    ...commonStats,
                    { key: 'productionOrders', label: 'Fabricación en Curso', icon: 'Cog', format: 'number' },
                    { key: 'activeOrders', label: 'Proyectos Activos', icon: 'HardHat', format: 'number' },
                ],
                productionStages: [
                    { key: 'PENDING', label: 'En Diseño', color: 'bg-zinc-100' },
                    { key: 'CUTTING', label: 'Corte', color: 'bg-orange-500' },
                    { key: 'WELDING', label: 'Soldadura', color: 'bg-blue-600' },
                    { key: 'ASSEMBLY', label: 'Armado', color: 'bg-amber-600' },
                    { key: 'PAINTING', label: 'Pintura', color: 'bg-purple-500' },
                    { key: 'DONE', label: 'Listo p/ Entrega', color: 'bg-emerald-500' },
                ],
                materialConfig: {
                    namePlaceholder: 'Ej: Caño 40x40 / Chapa N18 / Electrodo 6013',
                    brandPlaceholder: 'Ej: Acer Bragado / Acindar / Sin Marca',
                    defaultUnit: 'm',
                    defaultType: 'PERFIL',
                    types: [
                        { key: 'PERFIL', label: 'PERFIL / CAÑO' },
                        { key: 'CHAPA', label: 'CHAPA' },
                        { key: 'MACHO', label: 'MACHIMBRE' },
                        { key: 'HERRAJE', label: 'HERRAJE / ACCESORIO' },
                        { key: 'INSUMO', label: 'INSUMO (DISCO/ELECTRODO)' },
                        { key: 'OTRO', label: 'OTRO' },
                    ],
                    units: [
                        { key: 'm', label: 'Metros (m)' },
                        { key: 'uds', label: 'Unidades (uds)' },
                        { key: 'kg', label: 'Kilos (kg)' },
                        { key: 'barras', label: 'Barras (6m)' },
                        { key: 'placas', label: 'Placas/Chapas' },
                    ]
                },
                itemFields: [
                    { key: 'tipo_trabajo', label: 'Tipo de Trabajo', tipo: 'select', section: 'INFORMACIÓN DEL TRABAJO', options: ['Portón Corredizo', 'Portón Batiente', 'Reja', 'Escalera', 'Estructura', 'Puerta', 'Otro'], required: true },
                    { key: 'nombreProducto', label: 'Descripción / Nombre', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej: Portón principal frente' },
                    { key: 'medidas', label: 'Medidas (Ancho x Alto)', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', placeholder: 'Ej: 3.50 x 2.10 m' },

                    { key: 'material_estructura', label: 'Material Estructura', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej: Tubo 40x40' },
                    { key: 'revestimiento', label: 'Revestimiento (Machimbre/Chapa)', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej: Machimbre de Pino / Chapa N°18' },
                    { key: 'terminacion', label: 'Terminación / Proceso', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej: Pintura epoxi al horno' },
                    { key: 'color', label: 'Color Final', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej: Negro microtexturado' },

                    { key: 'motor', label: 'Incluye Motor', tipo: 'boolean', section: 'OPCIONALES' },
                    { key: 'instalacion', label: 'Requiere Instalación', tipo: 'boolean', section: 'OPCIONALES' },
                    { key: 'guias', label: 'Incluye Guías/Rieles', tipo: 'boolean', section: 'OPCIONALES' },
                    { key: 'cerradura', label: 'Cerradura de Seguridad', tipo: 'boolean', section: 'OPCIONALES' },
                    { key: 'refuerzos', label: 'Refuerzos Estructurales', tipo: 'boolean', section: 'OPCIONALES' },
                ],
            };
        case 'CARPINTERIA':
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/personal', '/produccion', '/reportes', '/ajustes'],
                labels: {
                    produccion: 'Estado de Armado',
                    items: 'Muebles y Componentes',
                    maquinas: 'Bancos / Operarios',
                    materiales: 'Maderas',
                    unidadName: 'Nombre del Banco / Operario',
                    unidadModel: 'Especialidad / Herramientas'
                },
                icons: {
                    pedidos: 'ClipboardList',
                    produccion: 'Hammer',
                    maquinas: 'Wrench',
                    materiales: 'Trees'
                },
                stats: [
                    ...commonStats,
                    { key: 'productionOrders', label: 'Muebles en Armado', icon: 'Hammer', format: 'number' },
                    { key: 'activeOrders', label: 'Pedidos Pendientes', icon: 'ShoppingCart', format: 'number' },
                ],
                productionStages: [
                    { key: 'PENDING', label: 'Planificación', color: 'bg-zinc-100' },
                    { key: 'CUTTING', label: 'Corte de Placas', color: 'bg-orange-400' },
                    { key: 'ARMADO', label: 'En Armado', color: 'bg-blue-500' },
                    { key: 'BARNIZADO', label: 'Lustre / Barniz', color: 'bg-amber-600' },
                    { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
                ],
                materialConfig: {
                    namePlaceholder: 'Ej: Placa Melamina 18mm / Cola Vinílica',
                    brandPlaceholder: 'Ej: Faplac / Egger / Sin Marca',
                    defaultUnit: 'uds',
                    defaultType: 'PLACA',
                    types: [
                        { key: 'PLACA', label: 'PLACA / TABLERO' },
                        { key: 'MADERA', label: 'MADERA MACIZA / LISTÓN' },
                        { key: 'HERRAJE', label: 'HERRAJE / TIRADOR' },
                        { key: 'INSUMO', label: 'INSUMO (COLA/LIJA)' },
                        { key: 'OTRO', label: 'OTRO' },
                    ],
                    units: [
                        { key: 'uds', label: 'Unidades (uds)' },
                        { key: 'm', label: 'Metros (m)' },
                        { key: 'm2', label: 'M2 (Superficie)' },
                    ]
                },
                itemFields: [
                    { key: 'nombreProducto', label: 'Mueble / Producto', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Mesa ratona' },
                    { key: 'madera', label: 'Tipo de Madera', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. Pino, Roble' },
                    { key: 'medidas', label: 'Dimensiones Finales', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', placeholder: 'Ej. 120 x 80 x 45 cm' },
                    { key: 'herrajes', label: 'Detalle de Herrajes', tipo: 'textarea', section: 'ESPECIFICACIONES TÉCNICAS' },
                ],
            };
        case 'GENERICO':
        default:
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/personal', '/produccion', '/reportes', '/ajustes'],
                labels: {
                    produccion: 'Producción',
                    items: 'Ítems de Pedido',
                    maquinas: 'Unidades de Trabajo',
                    materiales: 'Materiales',
                    unidadName: 'Nombre de la Unidad',
                    unidadModel: 'Tipo / Categoría'
                },
                icons: {
                    pedidos: 'ShoppingCart',
                    produccion: 'Cpu',
                    maquinas: 'Wrench',
                    materiales: 'Package'
                },
                stats: [
                    ...commonStats,
                    { key: 'activeOrders', label: 'Pedidos Activos', icon: 'ShoppingCart', format: 'number' },
                    { key: 'productionOrders', label: 'En Fila de Trabajo', icon: 'Clock', format: 'number' },
                ],
                productionStages: [
                    { key: 'PENDING', label: 'Pendiente', color: 'bg-zinc-100' },
                    { key: 'IN_PROGRESS', label: 'En Proceso', color: 'bg-blue-500' },
                    { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
                ],
                materialConfig: {
                    namePlaceholder: 'Ej: Insumo General / Producto',
                    brandPlaceholder: 'Ej: Marca / Proveedor',
                    defaultUnit: 'uds',
                    defaultType: 'INSUMO',
                    types: [
                        { key: 'INSUMO', label: 'INSUMO / MATERIAL' },
                        { key: 'PRODUCTO', label: 'PRODUCTO / REVENTA' },
                        { key: 'OTRO', label: 'OTRO' },
                    ],
                    units: [
                        { key: 'uds', label: 'Unidades (uds)' },
                        { key: 'kg', label: 'Kilos (kg)' },
                        { key: 'l', label: 'Litros (l)' },
                    ]
                },
                itemFields: [
                    { key: 'nombreProducto', label: 'Producto/Servicio', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Servicio de pintura' },
                    { key: 'descripcion', label: 'Descripción Extendida', tipo: 'textarea', section: 'INFORMACIÓN DEL TRABAJO' },
                ],
            };
    }
}
export function mapCategoryToRubro(category?: string): Rubro {
    if (!category) return 'GENERICO';

    const cat = category.toUpperCase().trim();

    // Mapeo flexible para variaciones comunes
    if (cat.includes('3D') || cat.includes('IMPRESION')) return 'IMPRESION_3D';
    if (cat.includes('MET') || cat.includes('HIERRO')) return 'METALURGICA';
    if (cat.includes('CARP') || cat.includes('MADERA')) return 'CARPINTERIA';

    // Si coincide exactamente con el enum
    if (['IMPRESION_3D', 'METALURGICA', 'CARPINTERIA', 'GENERICO'].includes(cat)) {
        return cat as Rubro;
    }

    return 'GENERICO';
}
