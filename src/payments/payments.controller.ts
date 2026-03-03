import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';

@Controller('orders/:id/payments')
@UseGuards(SupabaseAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    create(@Param('id') orderId: string, @Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(orderId, createPaymentDto);
    }

    @Get()
    findAll(@Param('id') orderId: string) {
        return this.paymentsService.findByOrder(orderId);
    }
}
