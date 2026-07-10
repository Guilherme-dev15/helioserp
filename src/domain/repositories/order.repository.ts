// src/domain/repositories/order.repository.ts
import { Order } from '../entities/order';

export abstract class OrderRepository {
  [x: string]: any;
  abstract create(order: Order): Promise<void>;
  abstract findById(tenantId: string, orderId: string): Promise<Order | null>;
  abstract findAll(tenantId: string): Promise<Order[]>;
  abstract update(order: Order, oldStatus?: string): Promise<void>;
}
