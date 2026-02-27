import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus } from '../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from '../history/entities/order-status-history.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderStatusHistory)
        private readonly statusHistoryRepository: Repository<OrderStatusHistory>,
    ) { }

    async create(createOrderDto: CreateOrderDto) {
        return this.orderRepository.save(createOrderDto as any);
    }

    async findAll(filters?: FilterOrderDto) {
        return this.orderRepository.find();
    }

    async findOne(id: string) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async updateStatus(id: string, status: OrderStatus, note?: string) {
        await this.orderRepository.update(id, { status });
        const history = this.statusHistoryRepository.create({
            orderId: id,
            toStatus: status,
            note,
        });
        await this.statusHistoryRepository.save(history);
        return this.findOne(id);
    }

    async update(id: string, updateOrderDto: UpdateOrderDto) {
        await this.orderRepository.update(id, updateOrderDto as any);
        return this.findOne(id);
    }

    async checkAndSetReadyStatus(id: string) {
        // Simple mock method to fulfill job service requirement
        return this.updateStatus(id, OrderStatus.READY, 'All jobs completed');
    }
}
