const express = require('express');
const TicketController = require('../controllers/ticketController');

const router = express.Router();

router.get('/', TicketController.getTickets);
router.post('/', TicketController.createTicket);
router.post('/processar', TicketController.processQueue);
router.delete('/clear', TicketController.clearTickets);
router.get('/welcome', TicketController.welcome);

module.exports = router;
