export declare enum OrderStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum JobStatus {
    QUEUED = "QUEUED",
    PRINTING = "PRINTING",
    PAUSED = "PAUSED",
    DONE = "DONE",
    CANCELLED = "CANCELLED"
}
export declare enum Priority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    MERCADO_PAGO = "MERCADO_PAGO",
    OTHER = "OTHER"
}
export declare enum FileType {
    IMAGE = "IMAGE",
    DOCUMENT = "DOCUMENT",
    STL = "STL",
    GCODE = "GCODE",
    OTHER = "OTHER"
}
export declare enum ProductFileRole {
    THUMBNAIL = "THUMBNAIL",
    GALLERY = "GALLERY",
    SOURCE = "SOURCE",
    PRINT_FILE = "PRINT_FILE",
    OTHER = "OTHER"
}
