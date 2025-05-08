import React from 'react';

interface ProofDisplayProps {
  code: string;
  proof: any;
}

const ProofDisplay: React.FC<ProofDisplayProps> = ({ code, proof }) => {
  return (
    <div className="proof-display">
      <h2>Prova de Retirada</h2>
      <div className="proof-info">
        <p className="code">{code}</p>
        <div className="proof-details">
          <h3>Detalhes da Prova</h3>
          <pre>{JSON.stringify(proof, null, 2)}</pre>
        </div>
        <p className="instructions">
          Apresente este código e a prova ao entregador para retirar seu produto.
          A prova garante que você é o dono legítimo do código, sem revelar sua identidade.
        </p>
      </div>
    </div>
  );
};

export default ProofDisplay; 