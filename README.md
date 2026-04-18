# 🚀 TrustChain - Blockchain Based eKYC System

TrustChain is a decentralized eKYC platform that uses blockchain and IPFS to provide secure and tamper-proof identity verification.

---

## 🌟 Features

- 🔐 Secure KYC using Blockchain
- 📂 File storage using IPFS (Pinata)
- 👤 User registration
- ✅ Verifier approval/rejection system
- 🌐 Fully decentralized system

---

## 🛠️ Tech Stack

- Frontend: React + Vite
- Blockchain: Ethereum (Sepolia Testnet)
- Smart Contracts: Solidity (Hardhat)
- Storage: IPFS (Pinata)
- Wallet: MetaMask

---

## ⚙️ How It Works

1. User uploads KYC document
2. File is stored on IPFS
3. IPFS CID is generated
4. CID is hashed using keccak256
5. Hash is stored on blockchain
6. Verifier approves/rejects user

---

## 📦 Project Structure

TrustChain/
│
├── contracts/
├── scripts/
├── artifacts/
├── blockchain-ekyc-ui/
└── hardhat.config.ts

---

## 🚀 Run Project

```bash
npm install
cd blockchain-ekyc-ui
npm install
npm run dev