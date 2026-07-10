import { randomUUID } from 'crypto';
import { OrderItem } from './order-item';

export type OrderStatus =
  | 'PENDING' // Novo pedido recebido
  | 'CONFIRMED' // Lojista aceitou e está separando
  | 'DISPATCHED' // Saiu para entrega ou está aguardando retirada
  | 'DELIVERED' // Finalizado com sucesso
  | 'CANCELED'; // Cancelado

// Mantemos apenas UMA interface OrderProps
export interface OrderProps {
  id?: string;
  tenantId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryMode?: string;
  items: OrderItem[];
  status?: OrderStatus;
  createdAt?: Date;
}

export class Order {
  private _id: string;
  private _tenantId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _createdAt: Date;
  private _customerName: string | null;
  private _customerPhone: string | null;
  private _deliveryMode: string;

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
    this._deliveryMode = props.deliveryMode ?? 'RETIRADA';
  }

  static create(props: OrderProps): Order {
    return new Order(props);
  }

  static restore(props: OrderProps): Order {
    return new Order({
      ...props,
      // 👈 Corrigido: ESLint avisou que o casting (as OrderStatus) já não era necessário
      status: props.status ?? 'PENDING',
    });
  }

  get id(): string {
    return this._id;
  }
  get tenantId(): string {
    return this._tenantId;
  }
  get items(): OrderItem[] {
    return [...this._items]; // Retorna cópia para evitar mutação externa
  }
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
  get deliveryMode(): string {
    return this._deliveryMode;
  }

  public changeStatus(newStatus: OrderStatus): void {
    // Mapeamento de quais transições são legais
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELED'],
      CONFIRMED: ['DISPATCHED', 'CANCELED'],
      DISPATCHED: ['DELIVERED', 'CANCELED'],
      DELIVERED: [], // Estado final: não muda mais
      CANCELED: [], // Estado final: não muda mais
    };

    const currentStatus = this._status;
    const possibleNextStates = allowedTransitions[currentStatus];

    // Verifica se a transição pedida está na lista de movimentos permitidos
    if (!possibleNextStates.includes(newStatus)) {
      throw new Error(
        `Transição ilegal: Um pedido em [${currentStatus}] não pode mudar para [${newStatus}].`,
      );
    }

    this._status = newStatus;
  }
}
