// src/domain/value-objects/order-fsm.ts
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
  private static readonly allowedTransitions: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    [OrderStatus.RECEBIDO]: [
      OrderStatus.PAGAMENTO_PENDENTE,
      OrderStatus.CANCELADO,
    ],
    [OrderStatus.PAGAMENTO_PENDENTE]: [
      OrderStatus.EM_PREPARACAO,
      OrderStatus.CANCELADO,
    ],
    [OrderStatus.EM_PREPARACAO]: [OrderStatus.PRONTO],
    [OrderStatus.PRONTO]: [
      OrderStatus.SAIU_PARA_ENTREGA,
      OrderStatus.CONCLUIDO,
    ],
    [OrderStatus.SAIU_PARA_ENTREGA]: [OrderStatus.CONCLUIDO],
    [OrderStatus.CONCLUIDO]: [],
    [OrderStatus.CANCELADO]: [],
  };

  public static transition(
    current: OrderStatus,
    target: OrderStatus,
  ): OrderStatus {
    const validNextStates = this.allowedTransitions[current];

    if (!validNextStates.includes(target)) {
      throw new OrderFSMException(current, target);
    }

    return target;
  }
}
