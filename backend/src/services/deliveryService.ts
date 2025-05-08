import { DeliveryCode } from '../models/DeliveryCode';
import { NotificationService } from './notificationService';
import { randomBytes } from 'crypto';

interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface DeliveryRequest {
  email: string;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress;
}

export class DeliveryService {
  private static instance: DeliveryService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  private generateCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async generateDeliveryCode(request: DeliveryRequest): Promise<string> {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24 horas

    const deliveryCode = new DeliveryCode({
      code,
      email: request.email,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      address: request.address,
      expiresAt
    });

    try {
      await deliveryCode.save();
      await this.notificationService.sendDeliveryCode(request.email, code);
      return code;
    } catch (error) {
      // Se falhar ao enviar o email, remove o código gerado
      await DeliveryCode.deleteOne({ code });
      throw new Error('Não foi possível enviar o email. Por favor, tente novamente.');
    }
  }

  async validateDeliveryCode(code: string): Promise<boolean> {
    const deliveryCode = await DeliveryCode.findOne({ code });
    if (!deliveryCode) {
      return false;
    }

    if (deliveryCode.status === 'expired' || deliveryCode.status === 'completed') {
      return false;
    }

    if (new Date() > deliveryCode.expiresAt) {
      deliveryCode.status = 'expired';
      await deliveryCode.save();
      return false;
    }

    return true;
  }

  async markDeliveryAsCompleted(code: string): Promise<void> {
    const deliveryCode = await DeliveryCode.findOne({ code });
    if (!deliveryCode) {
      throw new Error('Código de entrega não encontrado');
    }

    if (deliveryCode.status === 'completed') {
      throw new Error('Entrega já foi confirmada');
    }

    if (deliveryCode.status === 'expired') {
      throw new Error('Código de entrega expirado');
    }

    deliveryCode.status = 'completed';
    await deliveryCode.save();
  }

  async getDeliveryDetails(code: string): Promise<any> {
    const deliveryCode = await DeliveryCode.findOne({ code });
    if (!deliveryCode) {
      throw new Error('Código de entrega não encontrado');
    }

    return {
      code: deliveryCode.code,
      customerName: deliveryCode.customerName,
      customerPhone: deliveryCode.customerPhone,
      address: deliveryCode.address,
      status: deliveryCode.status,
      expiresAt: deliveryCode.expiresAt
    };
  }

  // Verifica códigos prestes a expirar e notifica os clientes
  public async checkExpiringCodes(): Promise<void> {
    const expiringTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora
    const expiringCodes = await DeliveryCode.find({
      status: 'pending',
      expiresAt: { $lt: expiringTime, $gt: new Date() }
    });

    for (const code of expiringCodes) {
      try {
        await this.notificationService.notifyCodeExpiring(code.email, code.code);
      } catch (error) {
        console.error('Erro ao enviar notificação de expiração:', error);
      }
    }
  }
} 