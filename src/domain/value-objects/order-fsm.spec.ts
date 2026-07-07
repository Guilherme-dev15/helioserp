// src/domain/value-objects/order-fsm.spec.ts
import { OrderFSM, OrderStatus, OrderFSMException } from './order-fsm';

describe('OrderFSM (Máquina de Estados do Pedido)', () => {
  it('deve permitir transição de RECEBIDO para PAGAMENTO_PENDENTE', () => {
    const nextState = OrderFSM.transition(
      OrderStatus.RECEBIDO,
      OrderStatus.PAGAMENTO_PENDENTE,
    );

    expect(nextState).toBe(OrderStatus.PAGAMENTO_PENDENTE);
  });

  it('deve lançar OrderFSMException ao tentar cancelar um pedido CONCLUIDO', () => {
    // Testa a instância da exceção
    expect(() => {
      OrderFSM.transition(OrderStatus.CONCLUIDO, OrderStatus.CANCELADO);
    }).toThrow(OrderFSMException);

    // Testa a mensagem exata
    expect(() => {
      OrderFSM.transition(OrderStatus.CONCLUIDO, OrderStatus.CANCELADO);
    }).toThrow('Transição inválida de CONCLUIDO para CANCELADO');
  });

  it('deve lançar OrderFSMException ao tentar retroceder de EM_PREPARACAO para RECEBIDO', () => {
    expect(() => {
      OrderFSM.transition(OrderStatus.EM_PREPARACAO, OrderStatus.RECEBIDO);
    }).toThrow(OrderFSMException);
  });
});
