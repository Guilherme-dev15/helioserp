/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { Order, OrderStatus } from '../../../domain/entities/order';
import { OrderItem } from '../../../domain/entities/order-item';

// 👇 Importamos os tipos gerados pelo próprio Prisma
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

// 👇 Criamos um tipo exato combinando o Pedido e os Itens
type OrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryMode: order.deliveryMode,
        status: order.status,
        totalAmount: order.total,
        createdAt: order.createdAt,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

  async findById(tenantId: string, orderId: string): Promise<Order | null> {
    const model = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });

    if (!model) return null;

    return this.mapToDomain(model);
  }

  async findAll(tenantId: string): Promise<Order[]> {
    const models = await this.prisma.order.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return models.map((model) => this.mapToDomain(model));
  }

  private mapToDomain(model: OrderWithItems): Order {
    const items = model.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    );

    return Order.restore({
      id: model.id,
      tenantId: model.tenantId,
      customerName: model.customerName,
      customerPhone: model.customerPhone,
      deliveryMode: model.deliveryMode,
      status: model.status as OrderStatus,
      createdAt: model.createdAt,
      items,
    });
  }

  async update(order: Order, oldStatus?: string): Promise<void> {
    // 👈 Usamos o $transaction para garantir atomicidade (tudo ou nada)
    await this.prisma.$transaction(async (tx) => {
      // 1. Atualiza o status do pedido
      await tx.order.update({
        where: { id: order.id, tenantId: order.tenantId },
        data: {
          status: order.status,
        },
      });

      // 2. Se houver mudança de status, cria o Log de Auditoria
      if (oldStatus && oldStatus !== order.status) {
        await tx.orderHistory.create({
          data: {
            orderId: order.id,
            oldStatus: oldStatus,
            newStatus: order.status,
          },
        });
      }
    });
  }
}
