import { Order } from '../entities/order';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  findById(tenantId: string, orderId: string): Promise<Order | null>;
  findAll(tenantId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
}
