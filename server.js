import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ IMPORTANTE: webhook usa RAW
app.use('/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: 'https://gerador-loterias-pro.vercel.app'
}));

app.use(express.json());

// Rota teste
app.get('/', (req, res) => {
  res.send('🚀 Backend Gerador Loterias PRO online');
});

// 🔔 WEBHOOK STRIPE
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook erro:', err.message);
    return res.status(400).send(`Webhook Error`);
  }

  // ✅ PAGAMENTO CONCLUÍDO
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('💰 Pagamento confirmado:', session.customer_email);

    // 👉 Aqui você libera o Premium
    // Exemplo:
    // salvar no banco
    // marcar usuário como premium
  }

  res.json({ received: true });
});

// Criar sessão de checkout
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
      success_url: 'https://gerador-loterias-pro.vercel.app/sucesso',
      cancel_url: 'https://gerador-loterias-pro.vercel.app/cancelado',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log('🚀 Backend Stripe rodando em produção');
});
