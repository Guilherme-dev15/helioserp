import { randomUUID } from 'crypto';
import { OrderItem } from './order-item';

export interface OrderProps {
  id?: string;
  tenantId: string;
  items: OrderItem[];
  status?: 'PENDING' | 'PAID' | 'CANCELED';
  createdAt?: Date;
  customerName?: string | null;
  customerPhone?: string | null;
}

export class Order {
  private _id: string;
  private _tenantId: string;
  private _items: OrderItem[];
  private _status: 'PENDING' | 'PAID' | 'CANCELED';
  private _createdAt: Date;
  private _customerName: string | null;
  private _customerPhone: string | null;

  private constructor(props: OrderProps) {
    if (!props.items || props.items.length === 0) {
      throw new Error('Um pedido deve conter pelo menos um item.');
    }

    this._id = props.id ?? randomUUID();
    this._tenantId = props.tenantId;
    this._items = props.items;
    this._status = props.status ?? 'PENDING';
    this._createdAt = props.createdAt ?? new Date();
    this._customerName = props.customerName ?? null;
    this._customerPhone = props.customerPhone ?? null;
  }

  static create(props: OrderProps): Order {
    return new Order(props);
  }

  static restore(props: OrderProps): Order {
    return new Order(props);
  }

  get id(): string {
    return this._id;
  }
  get tenantId(): string {
    return this._tenantId;
  }
  get items(): OrderItem[] {
    return [...this._items];
  } // Retorna cópia para evitar mutação externa
  get status(): string {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  // Regra de negócio: O total do pedido é a soma dos subtotais dos itens
  get total(): number {
    return this._items.reduce((acc, item) => acc + item.subTotal, 0);
  }
  get customerName(): string | null {
    return this._customerName;
  }
  get customerPhone(): string | null {
    return this._customerPhone;
  }
}
