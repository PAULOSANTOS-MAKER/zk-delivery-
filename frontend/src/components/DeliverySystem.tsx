import React, { useState } from 'react';
import Login from './Login';
import DeliveryVerification from './DeliveryVerification';

const DeliverySystem: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(true);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCode('');

    try {
      console.log('Enviando requisição para:', 'http://localhost:3001/api/request-code');
      console.log('Dados:', { email });
      
      const response = await fetch('http://localhost:3001/api/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Resposta recebida:', response.status);
      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (response.ok) {
        setSuccess('Código enviado para seu email! Verifique sua caixa de entrada.');
        setCode(data.code);
      } else {
        setError(data.message || 'Erro ao gerar código');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao conectar com o servidor. Por favor, verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-system">
      <header className="system-header">
        <h1>Sistema de Entregas</h1>
        <div className="role-toggle">
          <button
            className={isClient ? 'active' : ''}
            onClick={() => setIsClient(true)}
          >
            Cliente
          </button>
          <button
            className={!isClient ? 'active' : ''}
            onClick={() => setIsClient(false)}
          >
            Entregador
          </button>
        </div>
      </header>

      <main className="system-main">
        {isClient ? (
          <div className="client-section">
            <h2>Solicitar Código de Entrega</h2>
            <form onSubmit={handleRequestCode} className="code-form">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Seu email"
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Gerando...' : 'Solicitar Código'}
              </button>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
            </form>

            {code && (
              <div className="code-display">
                <h3>Seu Código de Entrega</h3>
                <div className="code">{code}</div>
                <p className="instructions">
                  Este código será necessário para que o entregador confirme sua entrega.
                  Ele expirará em 24 horas.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="delivery-section">
            {!token ? (
              <Login onLogin={handleLogin} />
            ) : (
              <DeliveryVerification token={token} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliverySystem; 