import mongoose from 'mongoose';

const LineItemSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true },
    designation: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    unitPriceHT: { type: Number, required: true, min: 0 },
    tva: { type: Number, required: true, min: 0 },
    lineTotalHT: { type: Number, required: true, min: 0 },
    lineTVA: { type: Number, required: true, min: 0 },
    lineTotalTTC: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    ice: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    supplier: { type: SupplierSchema, required: true },
    sender: {
      name: { type: String, required: true },
      ice: { type: String, required: true },
      rc: { type: String, required: true },
      taxId: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    lines: { type: [LineItemSchema], required: true },
    totals: {
      totalHT: { type: Number, required: true },
      totalTVA: { type: Number, required: true },
      totalTTC: { type: Number, required: true },
    },
    pdf: {
      url: { type: String, required: true },
      diskPath: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'not_resolved'],
      default: 'pending'
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', InvoiceSchema);