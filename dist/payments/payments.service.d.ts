import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly orderRepository;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>);
    create(orderId: string, createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findByOrder(orderId: string): Promise<Payment[]>;
}
