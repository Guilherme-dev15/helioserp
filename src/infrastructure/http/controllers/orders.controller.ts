import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckoutUseCase } from '../../../application/use-cases/checkout.use-case';
import { CheckoutDto } from '../dto/checkout.dto';
import { WhatsAppFormatter } from 'src/application/utils/whatsapp-formatter.util';

@Controller('orders') // Rota base: /orders
export class OrdersController {
  constructor(private readonly checkoutUseCase: CheckoutUseCase) {}

  @Post('checkout') // Rota: POST /orders/checkout
  @HttpCode(HttpStatus.CREATED)
  async checkout(@Body() dto: CheckoutDto) {
    const order = await this.checkoutUseCase.execute({
      tenantId: dto.tenantId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      deliveryMode: dto.deliveryMode,
      items: dto.items,
    });
    const whatsappText = WhatsAppFormatter.formatCheckoutMessage(
      order,
      dto.customerName,
    );
    return {
      message: 'Pedido realizado com sucesso!',
      orderId: order.id,
      total: order.total,
      status: order.status,
      whatsappText,
    };
  }
}
