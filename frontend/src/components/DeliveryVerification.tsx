import React, { useState } from 'react';

interface DeliveryVerificationProps {
  token: string;
}

const DeliveryVerification: React.FC<DeliveryVerificationProps> = ({ token }) => {
  const [code, setCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data.message || 'Erro ao verificar código');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!verificationResult?.valid) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/deliver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult({ ...verificationResult, status: 'delivered' });
      } else {
        setError(data.message || 'Erro ao confirmar entrega');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-verification">
      <h2>Verificação de Entrega</h2>
      <form onSubmit={handleVerify} className="verification-form">
        <div className="form-group">
          <label htmlFor="code">Código de Entrega:</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Digite o código"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar Código'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      {verificationResult && (
        <div className="verification-result">
          <h3>Resultado da Verificação</h3>
          <div className="status">
            Status: <span className={verificationResult.status}>{verificationResult.status}</span>
          </div>
          {verificationResult.valid && verificationResult.status === 'pending' && (
            <button onClick={handleDeliver} disabled={loading}>
              Confirmar Entrega
            </button>
          )}
          {verificationResult.proof && (
            <div className="proof-details">
              <h4>Detalhes da Prova</h4>
              <pre>{JSON.stringify(verificationResult.proof, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryVerification; 