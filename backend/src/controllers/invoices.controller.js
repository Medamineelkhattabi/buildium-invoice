import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { Invoice } from '../models/Invoice.js';
import { generateInvoicePdf, getSenderFixed } from '../services/pdf.service.js';

function computeTotals(lines) {
  let totalHT = 0;
  let totalTVA = 0;
  const computedLines = lines.map((l) => {
    const lineTotalHT = l.quantity * l.unitPriceHT;
    const lineTVA = (lineTotalHT * l.tva) / 100;
    const lineTotalTTC = lineTotalHT + lineTVA;
    totalHT += lineTotalHT;
    totalTVA += lineTVA;
    return { ...l, lineTotalHT, lineTVA, lineTotalTTC };
  });
  const totalTTC = totalHT + totalTVA;
  return { computedLines, totals: { totalHT, totalTVA, totalTTC } };
}

async function generateInvoiceNumber() {
  const today = dayjs().format('YYYYMMDD');
  const countToday = await Invoice.countDocuments({ createdAt: { $gte: dayjs().startOf('day').toDate(), $lte: dayjs().endOf('day').toDate() } });
  const seq = String(countToday + 1).padStart(3, '0');
  return `INV-${today}-${seq}`;
}

export async function listInvoices(req, res, next) {
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).lean();
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const { supplier, date, lines } = req.body;

    if (!supplier || !date || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const { computedLines, totals } = computeTotals(lines);
    const invoiceNumber = await generateInvoiceNumber();

    const { filePath, publicUrl } = await generateInvoicePdf({
      invoiceNumber,
      date,
      supplier,
      lines: computedLines,
      totals,
    });

    const invoiceDoc = await Invoice.create({
      invoiceNumber,
      date: new Date(date),
      supplier,
      sender: getSenderFixed(),
      lines: computedLines,
      totals,
      pdf: {
        url: publicUrl,
        diskPath: filePath,
      },
    });

    res.status(201).json(invoiceDoc);
  } catch (err) {
    next(err);
  }
}

export async function getInvoicePdf(req, res, next) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const diskPath = invoice.pdf?.diskPath;
    if (!diskPath || !fs.existsSync(diskPath)) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${path.basename(diskPath)}`);
    fs.createReadStream(diskPath).pipe(res);
  } catch (err) {
    next(err);
  }
}