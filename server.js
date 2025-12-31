import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================================
// 🔐 WEBHOOK STRIPE (ANTES DO JSON)
// ================================
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 🎯 Evento principal
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('✅ PAGAMENTO CONFIRMADO');
      console.log('Session ID:', session.id);
      console.log('Email:', session.customer_details?.email);

      // 🔓 AQUI você ativa o Premium de verdade
      // Exemplo:
      // salvarPremium(session.customer_details.email);
    }

    res.json({ received: true });
  }
);

// ================================
// 🌐 MIDDLEWARES NORMAIS
// ================================
app.use(cors({
  origin: 'https://gerador-loterias-pro.vercel.app'
}));

app.use(express.json());

// ================================
// 🧪 ROTA TESTE
// ================================
app.get('/', (req, res) => {
  res.send('🚀 Backend Gerador Loterias PRO online');
});

// ================================
// 💳 CHECKOUT STRIPE
// ================================
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
      success_url: 'https://gerador-loterias-pro.vercel.app/?premium=true',
      cancel_url: 'https://gerador-loterias-pro.vercel.app/cancelado',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Erro checkout:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================================
const PORT = 4242;
app.listen(PORT, () => {
  console.log('🚀 Backend Stripe rodando');
});
