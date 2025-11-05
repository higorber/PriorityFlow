const pool = require('../config/database');

class TicketModel {
  static async getAllTickets() {
    const query = `
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
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async createTicket(titulo, descricao, tipo_cliente) {
    const query = 'INSERT INTO tickets (titulo, descricao, tipo_cliente) VALUES ($1, $2, $3) RETURNING *';
    const values = [titulo, descricao, tipo_cliente];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getPendingTickets() {
    const query = "SELECT * FROM tickets WHERE status = 'PENDENTE'";
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateTicketUrgency(id, urgency) {
    const query = "UPDATE tickets SET urgencia_calculada = $1, status = 'CLASSIFICADO' WHERE id = $2";
    const values = [urgency, id];
    await pool.query(query, values);
  }

  static async clearAllTickets() {
    const query = 'DELETE FROM tickets';
    await pool.query(query);
  }
}

module.exports = TicketModel;
