export type OrderStatus = 'Pendiente' | 'En Producción' | 'Parcial' | 'Terminado' | 'Entregado';

export type MachineStatus = 'Libre' | 'Ocupada' | 'Mantenimiento';

export type Priority = 'VENCIDO' | 'PRÓXIMO' | 'EN TIEMPO';

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    totalOrders: number;
}

export type ItemPedido = {
    id: string
    nombreProducto: string
    descripcion?: string
    cantidad: number
    precioUnitario: number
    senia: number
    demoraEstimadaMinutos?: number
    // condicional por rubro:
    urlStl?: string
    pesoGramos?: number
    duracionEstimadaMinutos?: number
    medidas?: string
    material?: string
    terminacion?: string
}

export type Pedido = {
    id: string
    negocioId: string
    numero: string
    clienteId: string
    fechaCreacion: string
    fechaEntrega: string
    estado: OrderStatus
    observaciones?: string
    items: ItemPedido[]
    total: number
    totalSenias: number
    saldo: number
    urgencia: Priority
}

export interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    quantityProduced: number;
    unitCost: number;
    unitPrice: number;
    // Campos dinámicos por enfoque
    descripcion?: string;
    url_stl?: string;
    peso_gramos?: number;
    duracion_estimada_minutos?: number;
    demora_estimada_minutos?: number;
    medidas?: string;
    material?: string;
    terminacion?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    status: OrderStatus;
    createdAt: Date;
    deliveryDate: Date;
    items: OrderItem[];
    priority: Priority;
    totalCost: number;
    totalPrice: number;
    profit: number;
    margin: number;
}

export interface Machine {
    id: string;
    name: string;
    type: string;
    status: MachineStatus;
    currentJobId?: string;
    queue: string[]; // Order IDs
}
