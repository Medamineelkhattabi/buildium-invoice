import { Router } from 'express';
import { listInvoices, createInvoice, getInvoicePdf } from '../controllers/invoices.controller.js';

const router = Router();

router.get('/', listInvoices);
router.post('/', createInvoice);
router.get('/:id/pdf', getInvoicePdf);

export default router;