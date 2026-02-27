import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus } from '../common/enums';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from '../history/entities/order-status-history.entity';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly statusHistoryRepository;
    constructor(orderRepository: Repository<Order>, statusHistoryRepository: Repository<OrderStatusHistory>);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    findAll(filters?: FilterOrderDto): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    checkAndSetReadyStatus(id: string): Promise<Order>;
}
