const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gestor_prioridade',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tickets
      ORDER BY
        CASE
          WHEN status = 'PENDENTE' THEN 0
          WHEN urgencia_calculada = 'CRITICA' THEN 4
          WHEN urgencia_calculada = 'ALTA' THEN 3
          WHEN urgencia_calculada = 'MEDIA' THEN 2
          WHEN urgencia_calculada = 'BAIXA' THEN 1
        END DESC,
        created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { titulo, descricao, tipo_cliente } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tickets (titulo, descricao, tipo_cliente) VALUES ($1, $2, $3) RETURNING *',
      [titulo, descricao, tipo_cliente]
    );
    res.status(201).json({ message: 'Ticket criado com sucesso!', ticket: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
});

app.post('/api/processar', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tickets WHERE status = 'PENDENTE'");
    const tickets = result.rows;

    for (const ticket of tickets) {
      const urgency = calculateUrgency(ticket.descricao, ticket.tipo_cliente);
      await pool.query(
        "UPDATE tickets SET urgencia_calculada = $1, status = 'CLASSIFICADO' WHERE id = $2",
        [urgency, ticket.id]
      );
    }

    res.json({ message: 'Fila processada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar fila' });
  }
});

// Clear tickets endpoint for testing
app.delete('/api/tickets/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM tickets');
    res.json({ message: 'Tickets cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao limpar tickets' });
  }
});

function calculateUrgency(descricao, tipoCliente) {
  const desc = descricao.toLowerCase();

  // Keywords
  const critical = ['parado', 'offline', 'não funciona', 'down', 'fora do ar'];
  const high = ['erro', 'bug', 'lento', 'lentidão', 'falha de acesso'];
  const medium = ['dúvida', 'como fazer', 'ajuda', 'orientação'];

  let hasCritical = critical.some(word => desc.includes(word));
  let hasHigh = high.some(word => desc.includes(word));
  let hasMedium = medium.some(word => desc.includes(word));

  // Determine highest priority
  let priority = 0;
  if (hasCritical) priority = 3;
  else if (hasHigh) priority = 2;
  else if (hasMedium) priority = 1;

  // Matrix based on client type
  switch (tipoCliente) {
    case 'PREMIUM':
      if (priority === 3) return 'CRITICA';
      if (priority === 2) return 'ALTA';
      return 'MEDIA';
    case 'BASICO':
      if (priority === 3) return 'ALTA';
      if (priority === 2) return 'MEDIA';
      return 'BAIXA';
    case 'GRATUITO':
      if (priority === 3) return 'MEDIA';
      return 'BAIXA';
    default:
      return 'BAIXA';
  }
}

module.exports = { calculateUrgency };

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
