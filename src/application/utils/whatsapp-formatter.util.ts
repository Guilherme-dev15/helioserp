import { Order } from '../../domain/entities/order';

export class WhatsAppFormatter {
  static formatCheckoutMessage(order: Order, customerName?: string): string {
    const name = customerName ? customerName : 'Cliente';
    // Pega apenas o primeiro bloco do UUID para ficar curto e legível
    const shortId = order.id.split('-')[0].toUpperCase();
    const totalFormatted = (order.total / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    // Texto direto e focado em gratidão e fechamento
    let text = `Olá, aqui é ${name}!\n\n`;
    text += `Acabei de realizar o pedido *#${shortId}* através do catálogo.\n`;
    text += `*Total:* ${totalFormatted}\n\n`;
    text += `Muito obrigado! Aguardo as instruções para finalizarmos.`;

    // Codifica o texto para formato de URL (compatível com wa.me/?text=)
    return encodeURIComponent(text);
  }
}
