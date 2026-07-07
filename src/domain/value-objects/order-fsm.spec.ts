/* eslint-disable @typescript-eslint/no-floating-promises */
// src/domain/value-objects/order-fsm.spec.ts
import { describe, it } from 'node:test';
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
    expect(() => {
      OrderFSM.transition(OrderStatus.CONCLUIDO, OrderStatus.CANCELADO);
    }).toThrow(OrderFSMException);
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

type ThrowExpected = string | RegExp | (new (...args: any[]) => any);

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toThrow(expected?: ThrowExpected) {
      let threw = false;
      let error: unknown;

      try {
        if (typeof actual === 'function') {
          (actual as () => unknown)();
        } else {
          throw new Error(
            'Expected a function to be provided to expect(...).toThrow()',
          );
        }
      } catch (err) {
        threw = true;
        error = err;
      }

      if (!threw) {
        throw new Error('Expected function to throw an error');
      }

      if (expected === undefined) {
        return;
      }

      if (typeof expected === 'string') {
        if (!(error instanceof Error) || error.message !== expected) {
          throw new Error(
            `Expected error message to be ${expected}, but got ${String(error)}`,
          );
        }
        return;
      }

      if (expected instanceof RegExp) {
        if (!(error instanceof Error) || !expected.test(error.message)) {
          throw new Error(
            `Expected error message to match ${expected}, but got ${String(error)}`,
          );
        }
        return;
      }

      if (typeof expected === 'function') {
        if (!(error instanceof expected)) {
          throw new Error(`Expected error to be instance of ${expected.name}`);
        }
        return;
      }
    },
  };
}
