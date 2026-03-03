import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from '../common/enums';
import { CreateOrderDto, UpdateProgressDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
    ) { }

    /**
     * Obtener pedidos ordenados por dueDate asc, luego priority desc (asumiendo que mayor nro es más prioridad)
     */
    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ['items'],
            order: {
                dueDate: 'ASC',
                priority: 'DESC',
            },
        });
    }

    /**
     * Obtener un pedido por ID con sus ítems
     */
    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items'],
        });

        if (!order) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
        return order;
    }

    /**
     * Crear pedido completo con sus ítems
     */
    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const { items, ...orderData } = createOrderDto;

        // Usar transacción para asegurar atomicidad
        return await this.orderRepository.manager.transaction(async (manager) => {
            const order = manager.create(Order, {
                ...orderData,
                status: OrderStatus.PENDING,
            });

            const savedOrder = await manager.save(Order, order);

            if (items && items.length > 0) {
                const orderItems = items.map((item) =>
                    manager.create(OrderItem, {
                        ...item,
                        orderId: savedOrder.id,
                        doneQty: 0,
                    }),
                );
                await manager.save(OrderItem, orderItems);
            }

            return this.findOne(savedOrder.id);
        });
    }

    /**
     * Actualizar progreso (doneQty) de un ítem
     */
    async updateProgress(orderId: string, itemId: string, updateProgressDto: UpdateProgressDto): Promise<Order> {
        const { doneQty } = updateProgressDto;

        const item = await this.orderItemRepository.findOne({
            where: { id: itemId, orderId: orderId },
        });

        if (!item) {
            throw new NotFoundException(`Ítem ${itemId} no encontrado en el pedido ${orderId}`);
        }

        if (doneQty > item.qty) {
            throw new BadRequestException('La cantidad completada no puede ser mayor a la cantidad total');
        }

        item.doneQty = doneQty;
        await this.orderItemRepository.save(item);

        // Opcional: Si todos los ítems están terminados, marcar pedido como DONE
        const allItems = await this.orderItemRepository.find({ where: { orderId } });
        const isOrderComplete = allItems.every((i) => i.doneQty === i.qty);

        if (isOrderComplete) {
            await this.orderRepository.update(orderId, { status: OrderStatus.DONE });
        } else if (doneQty > 0) {
            await this.orderRepository.update(orderId, { status: OrderStatus.IN_PROGRESS });
        }

        return this.findOne(orderId);
    }

    /**
     * Actualizar estado manual del pedido (para compatibilidad o extras)
     */
    async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
        const { status } = updateStatusDto;
        await this.orderRepository.update(id, { status });
        return this.findOne(id);
    }
}
