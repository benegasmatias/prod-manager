import { OrdersService } from './orders.service';
import { CreateOrderDto, FilterOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus } from '../common/enums';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    findAll(filters: FilterOrderDto): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, status: OrderStatus, notes?: string): Promise<import("./entities/order.entity").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("./entities/order.entity").Order>;
}
