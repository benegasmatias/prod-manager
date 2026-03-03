"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const customers_module_1 = require("./customers/customers.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const jobs_module_1 = require("./jobs/jobs.module");
const payments_module_1 = require("./payments/payments.module");
const printers_module_1 = require("./printers/printers.module");
const materials_module_1 = require("./materials/materials.module");
const users_module_1 = require("./users/users.module");
const businesses_module_1 = require("./businesses/businesses.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DATABASE_URL'),
                    autoLoadEntities: true,
                    synchronize: false,
                    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                    extra: {
                        max: 20,
                        idleTimeoutMillis: 30000,
                        connectionTimeoutMillis: 2000,
                    }
                }),
            }),
            customers_module_1.CustomersModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            jobs_module_1.JobsModule,
            payments_module_1.PaymentsModule,
            printers_module_1.PrintersModule,
            materials_module_1.MaterialsModule,
            users_module_1.UsersModule,
            businesses_module_1.BusinessesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map