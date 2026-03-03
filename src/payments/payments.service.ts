import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async create(orderId: string, createPaymentDto: CreatePaymentDto) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        const payment = this.paymentRepository.create({
            orderId,
            ...createPaymentDto,
        });
        return this.paymentRepository.save(payment);
    }

    async findByOrder(orderId: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        return this.paymentRepository.find({
            where: { orderId },
            order: { paidAt: 'DESC' },
        });
    }
}
