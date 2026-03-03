import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateProgressDto } from './dto/order.dto';

@Controller('orders')
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
