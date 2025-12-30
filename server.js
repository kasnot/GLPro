import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

// Rota teste
app.get('/', (req, res) => {
  res.send('🚀 Backend Gerador Loterias PRO rodando!');
});

// Criar sessão de pagamento Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1SjoxTFVNPCBqlFYAmzXVvNY',
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/?premium=true',
      cancel_url: 'http://localhost:3000/cancelado',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message});
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`🚀 Backend Stripe rodando em http://localhost:${PORT}`);
});

