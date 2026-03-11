export type OrderStatus = string;

export type MachineStatus = 'IDLE' | 'PRINTING' | 'MAINTENANCE' | 'Libre' | 'Ocupada' | 'Mantenimiento';

export type Priority = 'VENCIDO' | 'PRÓXIMO' | 'EN TIEMPO' | 'LISTO';

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
    quantityProduced: number // Added for compatibility with production views
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
    // Metalúrgica extendido
    tipo_trabajo?: string
    material_estructura?: string
    tipo_chapa?: string
    color?: string
    motor?: boolean
    instalacion?: boolean
    guias?: boolean
    cerradura?: boolean
    refuerzos?: boolean
    revestimiento?: string
    metadata?: any
    estimatedUnitCost?: number
    estimatedSaleUnitPrice?: number
}

export type Employee = {
    id: string;
    firstName: string;
    lastName?: string;
    active: boolean;
    phone?: string;
    email?: string;
    specialties?: string;
}

export type ProductionJob = {
    id: string;
    title: string;
    status: string;
    responsable?: Employee;
    materialId?: string;
    material?: Material;
    notes?: string;
    sortRank: number;
    metadata?: any;
    printerId?: string;
    printer?: Machine;
}

export interface OrderStatusHistory {
    id: string
    changedAt: string
    fromStatus: OrderStatus | null
    toStatus: OrderStatus
    note?: string
    performedBy?: { firstName: string, lastName?: string }
}

export interface OrderFailure {
    id: string
    reason: string
    wastedGrams: number
    material?: { name: string, type: string }
    createdAt: string
}

export type Pedido = {
    id: string
    negocioId: string
    numero: string
    type?: 'CUSTOMER' | 'STOCK'
    clienteId: string
    clientName: string
    clientPhone?: string
    fechaCreacion: string
    fechaEntrega: string
    fechaActualizacion: string
    estado: OrderStatus
    observaciones?: string
    items: ItemPedido[]
    total: number
    totalPrice: number
    profit: number
    totalSenias: number
    saldo: number
    urgencia: Priority
    responsableGeneral?: Employee
    jobs?: ProductionJob[]
    statusHistory?: OrderStatusHistory[]
    failures?: OrderFailure[]
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
    estimatedUnitCost?: number;
    estimatedSaleUnitPrice?: number;
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
    maxFilaments?: number;
    currentJobId?: string;
    queue: string[]; // Order IDs
}

export interface Material {
    id: string;
    name: string;
    type: string;
    brand?: string;
    color?: string;
    remainingWeightGrams: number;
    totalWeightGrams: number;
    active: boolean;
}
