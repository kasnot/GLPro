import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Dados inválidos' });

  const hash = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?)'
    ).run(email, hash);

    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Usuário já existe' });
  }
});

export default router;
