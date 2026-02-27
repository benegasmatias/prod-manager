"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFileRole = exports.FileType = exports.PaymentMethod = exports.Priority = exports.JobStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "QUEUED";
    JobStatus["PRINTING"] = "PRINTING";
    JobStatus["PAUSED"] = "PAUSED";
    JobStatus["DONE"] = "DONE";
    JobStatus["CANCELLED"] = "CANCELLED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["NORMAL"] = "NORMAL";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["MERCADO_PAGO"] = "MERCADO_PAGO";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "IMAGE";
    FileType["DOCUMENT"] = "DOCUMENT";
    FileType["STL"] = "STL";
    FileType["GCODE"] = "GCODE";
    FileType["OTHER"] = "OTHER";
})(FileType || (exports.FileType = FileType = {}));
var ProductFileRole;
(function (ProductFileRole) {
    ProductFileRole["THUMBNAIL"] = "THUMBNAIL";
    ProductFileRole["GALLERY"] = "GALLERY";
    ProductFileRole["SOURCE"] = "SOURCE";
    ProductFileRole["PRINT_FILE"] = "PRINT_FILE";
    ProductFileRole["OTHER"] = "OTHER";
})(ProductFileRole || (exports.ProductFileRole = ProductFileRole = {}));
//# sourceMappingURL=enums.js.map