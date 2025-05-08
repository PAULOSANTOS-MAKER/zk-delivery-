import { DeliveryService } from '../services/deliveryService';

export class ExpirationChecker {
  private static instance: ExpirationChecker;
  private deliveryService: DeliveryService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.deliveryService = DeliveryService.getInstance();
  }

  public static getInstance(): ExpirationChecker {
    if (!ExpirationChecker.instance) {
      ExpirationChecker.instance = new ExpirationChecker();
    }
    return ExpirationChecker.instance;
  }

  public startChecking(): void {
    // Verifica a cada 15 minutos
    this.checkInterval = setInterval(async () => {
      try {
        await this.deliveryService.checkExpiringCodes();
      } catch (error) {
        console.error('Erro ao verificar códigos expirados:', error);
      }
    }, 15 * 60 * 1000);
  }

  public stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
} 