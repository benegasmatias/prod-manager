import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async create(createCustomerDto: CreateCustomerDto) {
        const customer = this.customerRepository.create(createCustomerDto);
        return this.customerRepository.save(customer);
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.customerRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            items,
            total,
            page,
            limit,
        };
    }

    async findOne(id: string) {
        const customer = await this.customerRepository.findOne({
            where: { id },
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        await this.findOne(id);
        await this.customerRepository.update(id, updateCustomerDto);
        return this.findOne(id);
    }
}
