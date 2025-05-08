# 🚚 ZK Delivery – Logística com Provas de Conhecimento Zero

ZK Delivery é um sistema de rastreamento e retirada de produtos onde o **destinatário não precisa revelar nenhuma identidade**. A retirada acontece por meio de um **código secreto validado com uma prova ZK (Zero-Knowledge Proof)**.  
Ideal para logística privada, envios sensíveis e máxima privacidade.

---

## 🔐 Funcionalidade

- Usuário recebe um **código secreto**
- Esse código é **hashado com Poseidon** e registrado na blockchain
- No momento da retirada, o usuário apresenta apenas a **prova de que conhece o código**
- Nenhum CPF, nome ou dado pessoal é revelado
- **Locker físico**, app ou entregador valida a prova ZK

---

## 🛠️ Tecnologias utilizadas

- **Rust + CosmWasm** — contratos inteligentes
- **Circom + SnarkJS** — geração e verificação de provas ZK
- **Poseidon Hash** — eficiente para ZK
- **Next.js (React + TypeScript)** — frontend moderno
- **Web3Auth** — login com e-mail + carteira Web3 (sem KYC)
- **Node.js / Express** — backend para geração de prova

---

