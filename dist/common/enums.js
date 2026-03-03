"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialType = exports.ProductFileRole = exports.PaymentMethod = exports.FileType = exports.Priority = exports.JobStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["DONE"] = "DONE";
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "QUEUED";
    JobStatus["PRINTING"] = "PRINTING";
    JobStatus["PAUSED"] = "PAUSED";
    JobStatus["FAILED"] = "FAILED";
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
var FileType;
(function (FileType) {
    FileType["STL"] = "STL";
    FileType["THREE_MF"] = "3MF";
    FileType["OBJ"] = "OBJ";
    FileType["IMAGE"] = "IMAGE";
    FileType["OTHER"] = "OTHER";
})(FileType || (exports.FileType = FileType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["TRANSFER"] = "TRANSFER";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["MP"] = "MP";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ProductFileRole;
(function (ProductFileRole) {
    ProductFileRole["MODEL"] = "MODEL";
    ProductFileRole["PREVIEW"] = "PREVIEW";
    ProductFileRole["INSTRUCTIONS"] = "INSTRUCTIONS";
})(ProductFileRole || (exports.ProductFileRole = ProductFileRole = {}));
var MaterialType;
(function (MaterialType) {
    MaterialType["PLA"] = "PLA";
    MaterialType["PETG"] = "PETG";
    MaterialType["ABS"] = "ABS";
    MaterialType["TPU"] = "TPU";
    MaterialType["RESIN"] = "RESIN";
})(MaterialType || (exports.MaterialType = MaterialType = {}));
//# sourceMappingURL=enums.js.map