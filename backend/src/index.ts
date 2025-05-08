import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { DeliveryService } from './services/deliveryService';
import { AuthService } from './services/authService';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { ExpirationChecker } from './tasks/expirationChecker';

const app = express();
const port = 3001;

// Conectar ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/zk-delivery')
  .then(() => {
    console.log('Conectado ao MongoDB');
    
    // Iniciar o verificador de expiração
    const expirationChecker = ExpirationChecker.getInstance();
    expirationChecker.startChecking();
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });

app.use(cors());
app.use(express.json());

// Gera um código único
function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

// Rotas públicas
app.post('/api/request-code', async (req, res) => {
  try {
    console.log('Recebendo requisição para gerar código:', req.body);
    const { email, customerName, customerPhone, address } = req.body;
    
    if (!email || !customerName || !customerPhone || !address) {
      console.error('Dados incompletos');
      return res.status(400).json({ 
        message: 'Todos os campos são obrigatórios: email, nome, telefone e endereço' 
      });
    }

    const deliveryService = DeliveryService.getInstance();
    const code = await deliveryService.generateDeliveryCode({
      email,
      customerName,
      customerPhone,
      address
    });
    
    console.log('Código gerado com sucesso para:', email);
    res.json({ code });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao gerar código de entrega',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// Nova rota para obter detalhes da entrega
app.get('/api/delivery/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const deliveryService = DeliveryService.getInstance();
    const details = await deliveryService.getDeliveryDetails(code);
    res.json(details);
  } catch (error) {
    console.error('Erro ao obter detalhes da entrega:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao obter detalhes da entrega'
    });
  }
});

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const authService = AuthService.getInstance();
    const result = await authService.register(name, email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro no registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const authService = AuthService.getInstance();
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : 'Erro no login' });
  }
});

// Rotas protegidas
app.post('/api/validate-code', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const deliveryService = DeliveryService.getInstance();
    const isValid = await deliveryService.validateDeliveryCode(code);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar código' });
  }
});

app.post('/api/deliver', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const deliveryService = DeliveryService.getInstance();
    await deliveryService.markDeliveryAsCompleted(code);
    res.json({ message: 'Entrega confirmada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao confirmar entrega' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 