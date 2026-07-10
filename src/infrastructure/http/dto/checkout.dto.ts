export class CheckoutItemDto {
  productId!: string;
  quantity!: number;
}

export class CheckoutDto {
  tenantId!: string;
  customerName?: string;
  customerPhone?: string;
  deliveryMode?: string;
  items!: CheckoutItemDto[];
}
