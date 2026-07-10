export interface OrderItemProps {
  productId: string;
  quantity: number;
  unitPrice: number; // Preço em centavos
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {
    if (this.props.quantity <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }
    if (this.props.unitPrice < 0) {
      throw new Error('O preço unitário não pode ser negativo.');
    }
  }

  static create(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  get productId(): string {
    return this.props.productId;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unitPrice(): number {
    return this.props.unitPrice;
  }

  // Regra de negócio: O subtotal é a quantidade vezes o preço unitário
  get subTotal(): number {
    return this.props.quantity * this.props.unitPrice;
  }
}
