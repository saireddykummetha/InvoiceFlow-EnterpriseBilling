import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "../api/clients.js";

export const clientService = {
  getAll: getClients,
  getById: getClient,
  get: getClient,
  create: createClient,
  update: updateClient,
  delete: deleteClient,
};

export default clientService;