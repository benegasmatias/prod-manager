import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateProgressDto, UpdateOrderStatusDto } from './dto/order.dto';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>);
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    updateProgress(orderId: string, itemId: string, updateProgressDto: UpdateProgressDto): Promise<Order>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order>;
}
