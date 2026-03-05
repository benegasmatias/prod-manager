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
    tipo: 'text' | 'number' | 'url' | 'textarea';
    required?: boolean;
}

export interface NegocioConfig {
    sidebarItems: string[];
    itemFields: CampoItem[];
    labels: {
        produccion: string;
        items: string;
    };
}

export function getNegocioConfig(rubro: Rubro): NegocioConfig {
    switch (rubro) {
        case 'IMPRESION_3D':
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/produccion', '/maquinas', '/reportes', '/ajustes'],
                labels: { produccion: 'Producción 3D', items: 'Modelos a Imprimir' },
                itemFields: [
                    { key: 'nombre', label: 'Nombre producto', tipo: 'text', required: true },
                    { key: 'url_stl', label: 'URL STL', tipo: 'url' },
                    { key: 'peso_gramos', label: 'Peso estimado (g)', tipo: 'number' },
                    { key: 'duracion_estimada_minutos', label: 'Duración (min)', tipo: 'number' },
                ],
            };
        case 'METALURGICA':
        case 'CARPINTERIA':
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/produccion', '/reportes', '/ajustes'],
                labels: { produccion: 'Seguimiento', items: 'Planos y Piezas' },
                itemFields: [
                    { key: 'nombre', label: 'Pieza / Trabajo', tipo: 'text', required: true },
                    { key: 'medidas', label: 'Medidas (LargoxAnchoxAlto)', tipo: 'textarea' },
                    { key: 'material', label: 'Material', tipo: 'text' },
                    { key: 'terminacion', label: 'Terminación', tipo: 'text' },
                    { key: 'demora_estimada_minutos', label: 'Demora Prod. (min)', tipo: 'number' },
                ],
            };
        case 'GENERICO':
        default:
            return {
                sidebarItems: ['/dashboard', '/pedidos', '/clientes', '/reportes', '/ajustes'],
                labels: { produccion: 'Producción', items: 'Ítems' },
                itemFields: [
                    { key: 'nombre', label: 'Producto/Servicio', tipo: 'text', required: true },
                    { key: 'descripcion', label: 'Descripción', tipo: 'text' },
                    { key: 'cantidad', label: 'Cantidad', tipo: 'number' },
                    { key: 'demora_estimada_minutos', label: 'Demora (min)', tipo: 'number' },
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
