"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const order_status_history_entity_1 = require("../history/entities/order-status-history.entity");
const production_job_entity_1 = require("../jobs/entities/production-job.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const printer_entity_1 = require("../printers/entities/printer.entity");
const material_entity_1 = require("../materials/entities/material.entity");
const file_asset_entity_1 = require("../products/entities/file-asset.entity");
const product_file_entity_1 = require("../products/entities/product-file.entity");
const job_status_history_entity_1 = require("../history/entities/job-status-history.entity");
const job_progress_entity_1 = require("../jobs/entities/job-progress.entity");
const user_entity_1 = require("../users/entities/user.entity");
const business_entity_1 = require("../businesses/entities/business.entity");
const business_membership_entity_1 = require("../businesses/entities/business-membership.entity");
const business_template_entity_1 = require("../businesses/entities/business-template.entity");
const dotenv = require("dotenv");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [
        customer_entity_1.Customer,
        product_entity_1.Product,
        order_entity_1.Order,
        order_item_entity_1.OrderItem,
        order_status_history_entity_1.OrderStatusHistory,
        production_job_entity_1.ProductionJob,
        payment_entity_1.Payment,
        printer_entity_1.Printer,
        material_entity_1.Material,
        file_asset_entity_1.FileAsset,
        product_file_entity_1.ProductFile,
        job_status_history_entity_1.JobStatusHistory,
        job_progress_entity_1.JobProgress,
        user_entity_1.User,
        business_entity_1.Business,
        business_membership_entity_1.BusinessMembership,
        business_template_entity_1.BusinessTemplate,
    ],
    migrations: [__dirname + '/migrations/*.ts'],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=data-source.js.map