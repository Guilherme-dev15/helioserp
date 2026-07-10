import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tenantId: string) {
    // 1. Pegamos a data de "hoje" à meia-noite para as métricas diárias
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Conta os pedidos que estão "vivos" no Kanban (na fila)
    const activeOrdersCount = await this.prisma.order.count({
      where: {
        tenantId,
        status: { in: ['PENDING', 'CONFIRMED', 'DISPATCHED'] },
      },
    });

    // 3. Conta quantos pedidos foram finalizados hoje
    const ordersDeliveredToday = await this.prisma.order.count({
      where: {
        tenantId,
        status: 'DELIVERED',
        updatedAt: { gte: today }, // Modificados a partir da meia-noite de hoje
      },
    });

    // 4. Soma o faturamento (apenas de pedidos que realmente foram entregues)
    const revenueAggregation = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        tenantId,
        status: 'DELIVERED',
      },
    });

    return {
      activeOrders: activeOrdersCount,
      deliveredToday: ordersDeliveredToday,
      totalRevenue: revenueAggregation._sum.totalAmount || 0, // Retorna 0 se não houver vendas
    };
  }
}
