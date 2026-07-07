// src/domain/value-objects/order-fsm.ts
// Responsabilidade: Garantir a validade das transições de status do pedido
// Chama: Ninguém | Chamado por: OrderEntity, TransicionarStatusUseCase

export enum OrderStatus {
  RECEBIDO = 'RECEBIDO',
  PAGAMENTO_PENDENTE = 'PAGAMENTO_PENDENTE',
  EM_PREPARACAO = 'EM_PREPARACAO',
  PRONTO = 'PRONTO',
  SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export class OrderFSMException extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Transição inválida de ${from} para ${to}`);
    this.name = 'OrderFSMException';
  }
}

export class OrderFSM {
  // Mapa de transições válidas: Estado Atual -> Estados Permitidos
  private static readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.RECEBIDO]: [OrderStatus.PAGAMENTO_PENDENTE, OrderStatus.CANCELADO],
    [OrderStatus.PAGAMENTO_PENDENTE]: [OrderStatus.EM_PREPARACAO, OrderStatus.CANCELADO],
    [OrderStatus.EM_PREPARACAO]: [OrderStatus.PRONTO], // Não pode cancelar em preparação
    [OrderStatus.PRONTO]: [OrderStatus.SAIU_PARA_ENTREGA, OrderStatus.CONCLUIDO], // Pode retirar no local (Concluído) ou sair pra entrega
    [OrderStatus.SAIU_PARA_ENTREGA]: [OrderStatus.CONCLUIDO],
    [OrderStatus.CONCLUIDO]: [], // Estado terminal
    [OrderStatus.CANCELADO]: [], // Estado terminal
  };

  /**
   * Tenta realizar uma transição de estado.
   * @throws OrderFSMException se a transição for inválida.
   */
  public static transition(current: OrderStatus, target: OrderStatus): OrderStatus {
    const validNextStates = this.allowedTransitions[current];

    if (!validNextStates.includes(target)) {
      throw new OrderFSMException(current, target);
    }

    return target;
  }
}
