"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const enums_1 = require("../common/enums");
let OrdersService = class OrdersService {
    constructor(orderRepository, orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }
    async findAll() {
        return this.orderRepository.find({
            relations: ['items'],
            order: {
                dueDate: 'ASC',
                priority: 'DESC',
            },
        });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
        return order;
    }
    async create(createOrderDto) {
        const { items, ...orderData } = createOrderDto;
        return await this.orderRepository.manager.transaction(async (manager) => {
            const order = manager.create(order_entity_1.Order, {
                ...orderData,
                status: enums_1.OrderStatus.PENDING,
            });
            const savedOrder = await manager.save(order_entity_1.Order, order);
            if (items && items.length > 0) {
                const orderItems = items.map((item) => manager.create(order_item_entity_1.OrderItem, {
                    ...item,
                    orderId: savedOrder.id,
                    doneQty: 0,
                }));
                await manager.save(order_item_entity_1.OrderItem, orderItems);
            }
            return this.findOne(savedOrder.id);
        });
    }
    async updateProgress(orderId, itemId, updateProgressDto) {
        const { doneQty } = updateProgressDto;
        const item = await this.orderItemRepository.findOne({
            where: { id: itemId, orderId: orderId },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Ítem ${itemId} no encontrado en el pedido ${orderId}`);
        }
        if (doneQty > item.qty) {
            throw new common_1.BadRequestException('La cantidad completada no puede ser mayor a la cantidad total');
        }
        item.doneQty = doneQty;
        await this.orderItemRepository.save(item);
        const allItems = await this.orderItemRepository.find({ where: { orderId } });
        const isOrderComplete = allItems.every((i) => i.doneQty === i.qty);
        if (isOrderComplete) {
            await this.orderRepository.update(orderId, { status: enums_1.OrderStatus.DONE });
        }
        else if (doneQty > 0) {
            await this.orderRepository.update(orderId, { status: enums_1.OrderStatus.IN_PROGRESS });
        }
        return this.findOne(orderId);
    }
    async updateStatus(id, updateStatusDto) {
        const { status } = updateStatusDto;
        await this.orderRepository.update(id, { status });
        return this.findOne(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map