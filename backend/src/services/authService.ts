import jwt from 'jsonwebtoken';
import { DeliveryPerson } from '../models/DeliveryPerson';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Registra um novo entregador
  public async register(name: string, email: string, password: string): Promise<{
    token: string;
    deliveryPerson: any;
  }> {
    const existingDeliveryPerson = await DeliveryPerson.findOne({ email });
    if (existingDeliveryPerson) {
      throw new Error('Email já cadastrado');
    }

    const deliveryPerson = new DeliveryPerson({
      name,
      email,
      password
    });

    await deliveryPerson.save();

    const token = this.generateToken(deliveryPerson);

    return {
      token,
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        email: deliveryPerson.email,
        status: deliveryPerson.status
      }
    };
  }

  // Autentica um entregador
  public async login(email: string, password: string): Promise<{
    token: string;
    deliveryPerson: any;
  }> {
    const deliveryPerson = await DeliveryPerson.findOne({ email });
    if (!deliveryPerson) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await deliveryPerson.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    if (deliveryPerson.status !== 'active') {
      throw new Error('Conta inativa');
    }

    const token = this.generateToken(deliveryPerson);

    return {
      token,
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        email: deliveryPerson.email,
        status: deliveryPerson.status
      }
    };
  }

  // Gera um token JWT
  private generateToken(deliveryPerson: any): string {
    return jwt.sign(
      {
        id: deliveryPerson._id,
        email: deliveryPerson.email,
        role: 'delivery_person'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verifica um token JWT
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
} 