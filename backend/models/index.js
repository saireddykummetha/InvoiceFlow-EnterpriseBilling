const mongoose = require('mongoose');
const { Schema } = mongoose;

// ---------- User ----------
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash
    role: { type: String, enum: ['admin', 'vendor', 'client', 'super_admin'], default: 'admin' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- BusinessProfile + AppSettings ----------
const businessProfileSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true },
  },
  { timestamps: true }
);

const appSettingsSchema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, unique: true },
    currency: { type: String, default: 'INR' },
    invoicePrefix: { type: String, default: 'INV' },
  },
  { timestamps: true }
);

// ---------- SignupVerificationOTP ----------
const signupOtpSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    name: String,
    companyName: String,
    passwordHash: String,
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);
signupOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ---------- PasswordResetOTP ----------
const passwordResetOtpSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ---------- Project ----------
const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'under_review', 'completed', 'cancelled', 'draft', 'pending'],
      default: 'active',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    budget: { type: Number, default: 0 },
    start_date: { type: Date },
    end_date: { type: Date },
    description: { type: String, default: '' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    vendor_ids: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Client ----------
const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    company_name: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    country: { type: String, default: 'India' },
    gstin: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Vendor ----------
const vendorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Task ----------
const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, enum: ['todo', 'pending', 'in_progress', 'submitted', 'under_review', 'revision_required', 'completed', 'blocked'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    due_date: { type: Date },
    assigned_to: { type: String, default: '' },
    progress_percentage: { type: Number, default: 0 },
    comments: [
      {
        text: String,
        author: String,
        created_at: { type: Date, default: Date.now },
      },
    ],
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Deliverable ----------
const deliverableSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending' },
    due_date: { type: Date },
    feedback: { type: String, default: '' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Quote ----------
const quoteSchema = new Schema(
  {
    quote_number: { type: String, required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
    items: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        unit_price: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    valid_until: { type: Date },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Invoice ----------
const invoiceSchema = new Schema(
  {
    invoice_number: { type: String, required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'pending', 'paid', 'overdue', 'sent'], default: 'pending' },
    items: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        unit_price: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    due_date: { type: Date },
    issue_date: { type: Date },
    discount: { type: Number, default: 0 },
    tax_rate: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
    template: { type: String, default: 'template1' },
    quote: { type: Schema.Types.ObjectId, ref: 'Quote' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Payment ----------
const paymentSchema = new Schema(
  {
    payment_number: { type: String, required: true },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    amount: { type: Number, required: true },
    method: { type: String, default: 'UPI' },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    business: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

// ---------- Notification ----------
const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ---------- Ticket ----------
const ticketSchema = new Schema(
  {
    ticket_number: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    replies: [
      {
        message: String,
        author: String,
        created_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model('User', userSchema),
  BusinessProfile: mongoose.model('BusinessProfile', businessProfileSchema),
  AppSettings: mongoose.model('AppSettings', appSettingsSchema),
  SignupVerificationOTP: mongoose.model('SignupVerificationOTP', signupOtpSchema),
  PasswordResetOTP: mongoose.model('PasswordResetOTP', passwordResetOtpSchema),
  Project: mongoose.model('Project', projectSchema),
  Client: mongoose.model('Client', clientSchema),
  Vendor: mongoose.model('Vendor', vendorSchema),
  Task: mongoose.model('Task', taskSchema),
  Deliverable: mongoose.model('Deliverable', deliverableSchema),
  Quote: mongoose.model('Quote', quoteSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Payment: mongoose.model('Payment', paymentSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Ticket: mongoose.model('Ticket', ticketSchema),
};
