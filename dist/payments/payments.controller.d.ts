import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(orderId: string, createPaymentDto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    findAll(orderId: string): Promise<import("./entities/payment.entity").Payment[]>;
}
