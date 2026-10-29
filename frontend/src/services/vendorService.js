import {
  getVendors,
  getVendorStats,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../api/vendors.js";

export const vendorService = {
  getAll: getVendors,
  getStats: getVendorStats,
  getById: getVendor,
  get: getVendor,
  create: createVendor,
  update: updateVendor,
  delete: deleteVendor,
};

export default vendorService;
