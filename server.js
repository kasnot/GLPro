//1️⃣ IMPORTS (topo do arquivo)

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//2️⃣ CONFIGURAÇÕES GERAIS

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: 'https://gerador-loterias-pro.vercel.app'
}));
app.use(express.json());

//3️⃣ ROTAS PÚBLICAS (SEM JWT)
//🔓 Rota de teste

app.get('/', (req, res) => {
  res.send('🚀 Backend Gerador Loterias PRO online');
});

//🔐 LOGIN (ETAPA 3 — JWT)

const users = []; // depois vira banco de dados

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  let user = users.find(u => u.email === email);

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      premium: false
    };
    users.push(user);
  }

  const senhaOk = await bcrypt.compare(password, user.password);
  if (!senhaOk) {
    return res.status(401).json({ error: 'Senha inválida' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    premium: user.premium
  });
});

//4️⃣ 🔐 MIDDLEWARE JWT (Proteção)
//👉 Este bloco vem DEPOIS do login e ANTES das rotas protegidas:

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

//5️⃣ 🟡 ROTA PROTEGIDA (EXEMPLO REAL)
//👉 SIM — ela vem logo abaixo do middleware

app.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email
  });
});

//6️⃣ STRIPE (Checkout)
//👉 Pode ficar depois, sem problema:

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_xxx', quantity: 1 }],
    success_url: 'https://gerador-loterias-pro.vercel.app/?premium=true',
    cancel_url: 'https://gerador-loterias-pro.vercel.app/cancelado',
  });

  res.json({ url: session.url });
});

//7️⃣ START DO SERVIDOR (FINAL DO ARQUIVO)

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log('🚀 Backend rodando');
});
