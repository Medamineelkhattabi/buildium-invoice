import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { generateInvoicePdf, getSenderFixed } from '../services/pdf.service.js';
import { exportToExcel, generateRevenueReport, generateAdvancedAnalytics } from '../services/export.service.js';

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
    const { search, status, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder } = req.query;
    
    // Construction du filtre
    let filter = {};
    
    // Recherche textuelle
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par statut
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filtre par date
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    // Filtre par montant
    if (minAmount || maxAmount) {
      filter['totals.totalTTC'] = {};
      if (minAmount) filter['totals.totalTTC'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['totals.totalTTC'].$lte = parseFloat(maxAmount);
    }
    
    // Construction du tri
    let sort = { createdAt: -1 }; // Par défaut
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'date':
          sort = { createdAt: order };
          break;
        case 'amount':
          sort = { 'totals.totalTTC': order };
          break;
        case 'client':
          sort = { 'supplier.name': order };
          break;
        case 'number':
          sort = { invoiceNumber: order };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }
    
    const invoices = await Invoice.find(filter).sort(sort).lean();
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

    const pdfResult = await generateInvoicePdf({
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
        url: pdfResult.publicUrl || null,
        diskPath: pdfResult.filePath || null,
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

    if (process.env.NODE_ENV === 'production') {
      // En production (Vercel), regénérer le PDF
      const pdfResult = await generateInvoicePdf({
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.createdAt,
        supplier: invoice.supplier,
        lines: invoice.lines,
        totals: invoice.totals
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
      res.send(pdfResult.buffer);
    } else {
      // En développement, servir le fichier
      const diskPath = invoice.pdf?.diskPath;
      if (!diskPath || !fs.existsSync(diskPath)) {
        return res.status(404).json({ message: 'PDF not found' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${path.basename(diskPath)}`);
      fs.createReadStream(diskPath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
}

export async function getStatistics(req, res, next) {
  try {
    const total = await Invoice.countDocuments();
    const pending = await Invoice.countDocuments({ status: 'pending' });
    const resolved = await Invoice.countDocuments({ status: 'resolved' });
    const notResolved = await Invoice.countDocuments({ status: 'not_resolved' });
    
    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$totals.totalTTC' } } }
    ]);

    res.json({
      total,
      pending,
      resolved,
      notResolved,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
}

export async function updateInvoiceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function exportInvoices(req, res, next) {
  try {
    const { format = 'xlsx', ...filterParams } = req.query;
    
    // Utiliser les mêmes filtres que listInvoices
    const { search, status, dateFrom, dateTo, minAmount, maxAmount } = filterParams;
    
    let filter = {};
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    if (minAmount || maxAmount) {
      filter['totals.totalTTC'] = {};
      if (minAmount) filter['totals.totalTTC'].$gte = parseFloat(minAmount);
      if (maxAmount) filter['totals.totalTTC'].$lte = parseFloat(maxAmount);
    }
    
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
    
    const exportResult = exportToExcel(invoices, format);
    
    res.json({
      message: `Export ${format.toUpperCase()} généré avec succès`,
      filename: exportResult.filename,
      downloadUrl: exportResult.publicUrl,
      count: invoices.length
    });
  } catch (err) {
    next(err);
  }
}

export async function getRevenueReport(req, res, next) {
  try {
    const { period = 'monthly', year, month } = req.query;
    
    let filter = {};
    
    // Filtrer par année/mois si spécifié
    if (year) {
      const startDate = dayjs(`${year}-01-01`).toDate();
      const endDate = dayjs(`${year}-12-31`).endOf('day').toDate();
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    if (month && year) {
      const startDate = dayjs(`${year}-${month}-01`).toDate();
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    const invoices = await Invoice.find(filter).lean();
    const report = generateRevenueReport(invoices, period);
    
    const analytics = generateAdvancedAnalytics(invoices);
    
    res.json({
      period,
      data: report,
      analytics,
      summary: {
        totalInvoices: invoices.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.totals.totalTTC, 0),
        averageAmount: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.totals.totalTTC, 0) / invoices.length : 0
      }
    });
  } catch (err) {
    next(err);
  }
}