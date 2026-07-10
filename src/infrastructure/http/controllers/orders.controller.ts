import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  UseGuards,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutUseCase } from '../../../application/use-cases/checkout.use-case';
import { CheckoutDto } from '../dto/checkout.dto';
import { WhatsAppFormatter } from '../../../application/utils/whatsapp-formatter.util';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.use-case';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';
import { OrderStatus } from '../../../domain/entities/order';
import { TrackOrderUseCase } from '../../../application/use-cases/track-order.use-case';
import { GetDashboardMetricsUseCase } from '../../../application/use-cases/get-dashboard-metrics.use-case';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// 👇 DTO simples para validar a entrada de dados do Admin
export class UpdateOrderStatusDto {
  newStatus!: OrderStatus;
}

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly trackOrderUseCase: TrackOrderUseCase,
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly tenantContext: TenantContext,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realiza o checkout de um novo pedido' }) // 👈 3. Descrição da rota
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
  @Get(':id/track')
  async trackOrder(@Param('id') orderId: string) {
    return this.trackOrderUseCase.execute(orderId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('metrics/dashboard')
  async getMetrics() {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    return this.getDashboardMetricsUseCase.execute(tenantId);
  }
}
