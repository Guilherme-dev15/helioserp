export class CheckoutItemDto {
  productId!: string;
  quantity!: number;
}

export class CheckoutDto {
  tenantId!: string; // A loja onde a compra está sendo feita
  customerName?: string; // Identificação leve (Opcional)
  customerPhone?: string; // Identificação leve (Opcional)
  items!: CheckoutItemDto[];
}
