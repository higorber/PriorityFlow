const TicketService = require('../services/ticketService');

class TicketController {
  static async getTickets(req, res, next) {
    try {
      const tickets = await TicketService.getAllTickets();
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  static async createTicket(req, res, next) {
    const { titulo, descricao, tipo_cliente } = req.body;
    if (!titulo || !descricao || !tipo_cliente) {
      return res.status(400).json({ error: 'Campos obrigatórios: titulo, descricao, tipo_cliente' });
    }
    try {
      const ticket = await TicketService.createTicket(titulo, descricao, tipo_cliente);
      res.status(201).json({ message: 'Ticket criado com sucesso!', ticket });
    } catch (error) {
      next(error);
    }
  }

  static async processQueue(req, res, next) {
    try {
      const result = await TicketService.processQueue();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async clearTickets(req, res, next) {
    try {
      const result = await TicketService.clearTickets();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static welcome(req, res) {
    console.log(`Request received: ${req.method} ${req.path}`);
    res.json({ message: 'Welcome to the PriorityFlow API!' });
  }
}

module.exports = TicketController;
