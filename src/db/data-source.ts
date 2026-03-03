import { DataSource } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../history/entities/order-status-history.entity';
import { ProductionJob } from '../jobs/entities/production-job.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Printer } from '../printers/entities/printer.entity';
import { Material } from '../materials/entities/material.entity';
import { FileAsset } from '../products/entities/file-asset.entity';
import { ProductFile } from '../products/entities/product-file.entity';
import { JobStatusHistory } from '../history/entities/job-status-history.entity';
import { JobProgress } from '../jobs/entities/job-progress.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { BusinessMembership } from '../businesses/entities/business-membership.entity';
import { BusinessTemplate } from '../businesses/entities/business-template.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [
        Customer,
        Product,
        Order,
        OrderItem,
        OrderStatusHistory,
        ProductionJob,
        Payment,
        Printer,
        Material,
        FileAsset,
        ProductFile,
        JobStatusHistory,
        JobProgress,
        User,
        Business,
        BusinessMembership,
        BusinessTemplate,
    ],
    migrations: [__dirname + '/migrations/*.ts'],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
