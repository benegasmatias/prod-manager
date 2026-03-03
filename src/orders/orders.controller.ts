import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateProgressDto } from './dto/order.dto';
import { SupabaseAuthGuard } from '../users/guards/supabase-auth.guard';

@Controller('orders')
@UseGuards(SupabaseAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Patch(':orderId/items/:itemId/progress')
    async updateProgress(
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Param('itemId', ParseUUIDPipe) itemId: string,
        @Body() updateProgressDto: UpdateProgressDto,
    ) {
        return this.ordersService.updateProgress(orderId, itemId, updateProgressDto);
    }
}
