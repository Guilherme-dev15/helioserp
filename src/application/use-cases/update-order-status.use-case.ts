/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderStatus } from '../../domain/entities/order';

export interface UpdateOrderStatusCommand {
  tenantId: string;
  orderId: string;
  newStatus: OrderStatus;
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOrderStatusCommand): Promise<void> {
    // 1. Busca o pedido na base de dados (Isolamento por Tenant)
    const order = await this.orderRepository.findById(
      command.tenantId,
      command.orderId,
    );

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    // 2. Aciona o Motor da FSM (Se for ilegal, ele atira um Error e trava o fluxo aqui)
    order.changeStatus(command.newStatus);

    // 3. Persiste a mudança segura
    await this.orderRepository.update(order);
  }
}
