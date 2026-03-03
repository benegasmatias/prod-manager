import { AppDataSource } from './data-source';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../common/enums';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('🌱 Data Source has been initialized for seeding!');

        const orderRepo = AppDataSource.getRepository(Order);
        const itemRepo = AppDataSource.getRepository(OrderItem);
        const userRepo = AppDataSource.getRepository(User);

        // Limpiar datos previos si los hay (Opcional, pero util para pruebas limpias)
        await itemRepo.query('DELETE FROM order_items');
        await orderRepo.query('DELETE FROM orders');
        await userRepo.query('DELETE FROM users');

        // 0. Usuario de ejemplo (Supabase UID simulado)
        const sampleUser = userRepo.create({
            id: 'd8866567-5d0b-4780-8777-62886f756677',
            email: 'matias@example.com',
            fullName: 'Matias Benegas',
        });
        await userRepo.save(sampleUser);
        console.log('✅ Usuario de ejemplo creado.');

        // 1. Pedido 1: Fecha de entrega cercana (1 día despues de hoy) + 2 items
        const dueSoon = new Date();
        dueSoon.setDate(dueSoon.getDate() + 1);

        const order1 = orderRepo.create({
            clientName: 'Cliente Urgente (Matias)',
            dueDate: dueSoon,
            priority: 10,
            status: OrderStatus.PENDING,
        });
        const savedOrder1 = await orderRepo.save(order1);

        await itemRepo.save([
            itemRepo.create({
                orderId: savedOrder1.id,
                name: 'Soporte Laptop Gamer',
                description: 'Diseño reforzado en PLA blanco',
                stlUrl: 'https://example.com/stl/soporte-laptop.stl',
                estimatedMinutes: 360,
                weightGrams: 240,
                price: 15.5,
                qty: 2,
                doneQty: 0,
            }),
            itemRepo.create({
                orderId: savedOrder1.id,
                name: 'Pikachu Articulado',
                description: 'Pintado a mano, 10cm',
                stlUrl: 'https://example.com/stl/pikachu.stl',
                estimatedMinutes: 120,
                weightGrams: 45,
                price: 25.0,
                qty: 1,
                doneQty: 0,
            }),
        ]);
        console.log('✅ Pedido 1 creado con 2 items.');

        // 2. Pedido 2: Fecha de entrega más lejana (10 días despues de hoy) + 3 items
        const dueFar = new Date();
        dueFar.setDate(dueFar.getDate() + 10);

        const order2 = orderRepo.create({
            clientName: 'Juan Gomez (Pedidazo)',
            dueDate: dueFar,
            priority: 5,
            status: OrderStatus.PENDING,
        });
        const savedOrder2 = await orderRepo.save(order2);

        await itemRepo.save([
            itemRepo.create({
                orderId: savedOrder2.id,
                name: 'Maceta Geometríca S',
                description: 'Material: PETG, Color: Negro',
                stlUrl: 'https://example.com/stl/maceta-s.stl',
                estimatedMinutes: 80,
                weightGrams: 30,
                price: 5.0,
                qty: 5,
                doneQty: 0,
            }),
            itemRepo.create({
                orderId: savedOrder2.id,
                name: 'Maceta Geometríca M',
                description: 'Material: PETG, Color: Negro',
                stlUrl: 'https://example.com/stl/maceta-m.stl',
                estimatedMinutes: 150,
                weightGrams: 65,
                price: 8.5,
                qty: 3,
                doneQty: 0,
            }),
            itemRepo.create({
                orderId: savedOrder2.id,
                name: 'Llavero Logotipo',
                description: 'Lote de llaveros corporativos',
                stlUrl: 'https://example.com/stl/logo.stl',
                estimatedMinutes: 15,
                weightGrams: 5,
                price: 1.5,
                qty: 20,
                doneQty: 0,
            }),
        ]);
        console.log('✅ Pedido 2 creado con 3 items.');

        console.log('🚀 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

seed();
