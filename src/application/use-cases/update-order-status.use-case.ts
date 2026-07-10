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
    const order = await this.orderRepository.findById(
      command.tenantId,
      command.orderId,
    );

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    // 1. Captura o status original ANTES da mudança
    const oldStatus = order.status;

    // 2. Aciona o Motor da FSM (validação segura)
    order.changeStatus(command.newStatus);

    // 3. Persiste o pedido E envia o status antigo para criar o log
    await this.orderRepository.update(order, oldStatus);
  }
}
