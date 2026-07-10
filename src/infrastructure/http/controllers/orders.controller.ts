import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutUseCase } from '../../../application/use-cases/checkout.use-case';
import { CheckoutDto } from '../dto/checkout.dto';
import { WhatsAppFormatter } from '../../../application/utils/whatsapp-formatter.util';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.use-case';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';
import { OrderStatus } from '../../../domain/entities/order';

// 👇 DTO simples para validar a entrada de dados do Admin
export class UpdateOrderStatusDto {
  newStatus!: OrderStatus;
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    // 👇 Injetamos o novo caso de uso e o contexto de tenant (para segurança)
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly tenantContext: TenantContext,
  ) {}

  // 🟢 ROTA PÚBLICA (Qualquer cliente pode acessar)
  @Post('checkout')
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

  // 🔴 ROTA PROTEGIDA (Apenas Lojistas com Token JWT válido)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    // Pega o ID da loja injetado silenciosamente pelo nosso Interceptor
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    await this.updateOrderStatusUseCase.execute({
      tenantId,
      orderId,
      newStatus: dto.newStatus,
    });

    return {
      message: `Status alterado de forma segura para ${dto.newStatus}.`,
    };
  }
}
