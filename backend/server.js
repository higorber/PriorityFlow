const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || (process.env.NODE_ENV === 'test' ? 3005 : 3000);

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
  client_encoding: 'utf8',
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Welcome endpoint for API health check.
 */
app.get('/api/welcome', (req, res) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  res.json({ message: 'Welcome to the PriorityFlow API!' });
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
  if (!titulo || !descricao || !tipo_cliente) {
    return res.status(400).json({ error: 'Campos obrigatórios: titulo, descricao, tipo_cliente' });
  }
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

/**
 * Calculates the urgency level of a ticket based on description and client type.
 * @param {string} descricao - The ticket description.
 * @param {string} tipoCliente - The client type ('PREMIUM', 'BASICO', 'GRATUITO').
 * @returns {string} The urgency level ('CRITICA', 'ALTA', 'MEDIA', 'BAIXA').
 */
function calculateUrgency(descricao, tipoCliente) {
  const desc = descricao.toLowerCase();

  // Keywords for urgency levels
  const keywords = {
    critical: ['parado', 'offline', 'não funciona', 'down', 'fora do ar'],
    high: ['erro', 'bug', 'lento', 'lentidão', 'falha de acesso'],
    medium: ['dúvida', 'como fazer', 'ajuda', 'orientação']
  };

  // Determine priority based on keywords (highest priority wins)
  const priority = keywords.critical.some(word => desc.includes(word)) ? 3 :
                   keywords.high.some(word => desc.includes(word)) ? 2 :
                   keywords.medium.some(word => desc.includes(word)) ? 1 : 0;

  // Urgency matrix based on client type
  const urgencyMatrix = {
    PREMIUM: ['MEDIA', 'MEDIA', 'ALTA', 'CRITICA'],
    BASICO: ['BAIXA', 'MEDIA', 'ALTA', 'ALTA'],
    GRATUITO: ['BAIXA', 'BAIXA', 'MEDIA', 'MEDIA']
  };

  return urgencyMatrix[tipoCliente]?.[priority] || 'BAIXA';
}

module.exports = { calculateUrgency };

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
