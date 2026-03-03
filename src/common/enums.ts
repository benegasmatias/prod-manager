export enum OrderStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    DRAFT = 'DRAFT',
    CONFIRMED = 'CONFIRMED',
    READY = 'READY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum JobStatus {
    QUEUED = 'QUEUED',
    PRINTING = 'PRINTING',
    PAUSED = 'PAUSED',
    FAILED = 'FAILED',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED',
}

export enum Priority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum FileType {
    STL = 'STL',
    THREE_MF = '3MF',
    OBJ = 'OBJ',
    IMAGE = 'IMAGE',
    OTHER = 'OTHER',
}

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    CARD = 'CARD',
    MP = 'MP',
}

export enum ProductFileRole {
    MODEL = 'MODEL',
    PREVIEW = 'PREVIEW',
    INSTRUCTIONS = 'INSTRUCTIONS',
}

export enum MaterialType {
    PLA = 'PLA',
    PETG = 'PETG',
    ABS = 'ABS',
    TPU = 'TPU',
    RESIN = 'RESIN',
}
