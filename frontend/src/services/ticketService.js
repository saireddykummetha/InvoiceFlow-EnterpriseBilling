import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  replyTicket,
} from "../api/tickets.js";

export const ticketService = {
  getAll: getTickets,
  get: getTicket,
  getById: getTicket,
  create: createTicket,
  update: updateTicket,
  delete: deleteTicket,
  remove: deleteTicket,
  reply: replyTicket,
};

export default ticketService;
