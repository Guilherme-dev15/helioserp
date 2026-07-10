/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class TrackOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string) {
    // Busca o pedido e faz o JOIN automático com os itens e o histórico
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }, // Traz o nome do produto
        },
        histories: {
          orderBy: { createdAt: 'desc' }, // Histórico mais recente primeiro
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    // Mapeamento Seguro (DTO): Filtramos os dados para não vazar IDs internos do Tenant
    return {
      orderId: order.id,
      status: order.status,
      customerName: order.customerName,
      deliveryMode: order.deliveryMode,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      history: order.histories.map((h) => ({
        status: h.newStatus,
        date: h.createdAt,
      })),
    };
  }
}
