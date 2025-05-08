import nodemailer from 'nodemailer';
import { DeliveryCode } from '../models/DeliveryCode';

export class NotificationService {
  private static instance: NotificationService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Notify client when delivery code is generated
  public async notifyCodeGenerated(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Seu código de entrega foi gerado',
      html: `
        <h2>Seu código de entrega foi gerado!</h2>
        <p>Seu código de entrega é: <strong>${code}</strong></p>
        <p>Este código será necessário para que o entregador possa confirmar a entrega.</p>
        <p>O código expirará em 24 horas.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar notificação');
    }
  }

  // Notify client when delivery is confirmed
  public async notifyDeliveryConfirmed(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Sua entrega foi confirmada',
      html: `
        <h2>Sua entrega foi confirmada!</h2>
        <p>O código ${code} foi utilizado para confirmar a entrega.</p>
        <p>Obrigado por utilizar nosso serviço!</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar notificação');
    }
  }

  // Notify client when delivery code is about to expire
  public async notifyCodeExpiring(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Seu código de entrega está prestes a expirar',
      html: `
        <h2>Seu código de entrega está prestes a expirar!</h2>
        <p>O código ${code} expirará em breve.</p>
        <p>Por favor, solicite um novo código se necessário.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar notificação');
    }
  }

  async sendDeliveryCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Seu código de entrega ZK Delivery',
      html: `
        <h1>Seu código de entrega foi gerado!</h1>
        <p>Use o código abaixo para acompanhar sua entrega:</p>
        <h2 style="font-size: 24px; color: #4CAF50; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${code}</h2>
        <p>Este código expira em 24 horas.</p>
        <p>O entregador usará este código para confirmar a entrega.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar o código por email');
    }
  }

  async sendDeliveryDetails(email: string, code: string, details: any): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Detalhes da sua entrega ZK Delivery',
      html: `
        <h1>Detalhes da sua entrega</h1>
        <p>Código de entrega: <strong>${code}</strong></p>
        <h2>Informações do Cliente:</h2>
        <p>Nome: ${details.customerName}</p>
        <p>Telefone: ${details.customerPhone}</p>
        <h2>Endereço de Entrega:</h2>
        <p>Rua: ${details.address.street}, ${details.address.number}</p>
        ${details.address.complement ? `<p>Complemento: ${details.address.complement}</p>` : ''}
        <p>Bairro: ${details.address.neighborhood}</p>
        <p>Cidade: ${details.address.city}</p>
        <p>Estado: ${details.address.state}</p>
        <p>CEP: ${details.address.zipCode}</p>
        <p>Status: ${details.status}</p>
        <p>Expira em: ${new Date(details.expiresAt).toLocaleString()}</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar os detalhes da entrega por email');
    }
  }
} 