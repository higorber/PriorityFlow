const TicketModel = require('../models/ticketModel');
const { calculateUrgency } = require('../utils/urgencyCalculator');

class TicketService {
  static async getAllTickets() {
    return await TicketModel.getAllTickets();
  }

  static async createTicket(titulo, descricao, tipo_cliente) {
    return await TicketModel.createTicket(titulo, descricao, tipo_cliente);
  }

  static async processQueue() {
    const tickets = await TicketModel.getPendingTickets();

    for (const ticket of tickets) {
      const urgency = calculateUrgency(ticket.descricao, ticket.tipo_cliente);
      await TicketModel.updateTicketUrgency(ticket.id, urgency);
    }

    return { message: 'Fila processada com sucesso' };
  }

  static async clearTickets() {
    await TicketModel.clearAllTickets();
    return { message: 'Tickets cleared successfully' };
  }
}

module.exports = TicketService;
