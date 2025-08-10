import { Router } from 'express';
import { listInvoices, createInvoice, getInvoicePdf, getStatistics, updateInvoiceStatus, exportInvoices, getRevenueReport } from '../controllers/invoices.controller.js';

const router = Router();

router.get('/statistics', getStatistics);
router.get('/export', exportInvoices);
router.get('/reports/revenue', getRevenueReport);
router.get('/', listInvoices);
router.post('/', createInvoice);
router.get('/:id/pdf', getInvoicePdf);
router.patch('/:id/status', updateInvoiceStatus);

export default router;