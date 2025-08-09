import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SENDER_FIXED = {
  name: 'BUILDIUM S.A.R.L',
  ice: '003255241000096',
  rc: 'Tanger N° 137203',
  taxId: '53738133',
  address: 'RTE TETOUAN, NICE CENTER ET4 N20, TANGER',
  phone: '+212 6 61 34 35 83',
  email: 'Contact@buildium.ma',
};

export function getSenderFixed() {
  return SENDER_FIXED;
}

export async function generateInvoicePdf({ invoiceNumber, date, supplier, lines, totals }) {
  const pdfsDir = path.join(__dirname, '..', 'storage', 'pdfs');
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const filename = `${invoiceNumber}.pdf`;
  const filePath = path.join(pdfsDir, filename);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc
    .fontSize(20)
    .text('FACTURE', { align: 'right' })
    .moveDown();

  // Sender and Supplier Blocks
  doc
    .fontSize(12)
    .text(SENDER_FIXED.name)
    .text(`ICE: ${SENDER_FIXED.ice}`)
    .text(`RC: ${SENDER_FIXED.rc}`)
    .text(`Id. fiscale: ${SENDER_FIXED.taxId}`)
    .text(SENDER_FIXED.address)
    .text(`Tél: ${SENDER_FIXED.phone}`)
    .text(`Email: ${SENDER_FIXED.email}`)
    .moveDown();

  doc
    .fontSize(12)
    .text('Destinataire:', { underline: true })
    .text(supplier.name)
    .text(supplier.address)
    .text(`ICE: ${supplier.ice}`)
    .text(`Tél: ${supplier.phone}`)
    .text(`Email: ${supplier.email}`)
    .text(`Interlocuteur: ${supplier.contact}`)
    .moveDown();

  doc
    .text(`Facture N°: ${invoiceNumber}`)
    .text(`Date: ${dayjs(date).format('DD/MM/YYYY')}`)
    .moveDown();

  // Table header
  const tableTop = doc.y + 10;
  const colX = [40, 110, 300, 360, 420, 480];
  const drawHeader = () => {
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Réf', colX[0], tableTop)
      .text('Désignation', colX[1], tableTop)
      .text('Qté', colX[2], tableTop)
      .text('Unité', colX[3], tableTop)
      .text('PU HT', colX[4], tableTop)
      .text('TVA %', colX[5], tableTop, { continued: false });
  };

  drawHeader();
  doc.moveDown();

  // Lines
  doc.font('Helvetica').fontSize(10);
  let y = tableTop + 18;
  lines.forEach((line) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
      drawHeader();
      y += 18;
    }
    doc.text(line.reference, colX[0], y);
    doc.text(line.designation, colX[1], y, { width: 180 });
    doc.text(String(line.quantity), colX[2], y);
    doc.text(line.unit, colX[3], y);
    doc.text(line.unitPriceHT.toFixed(2), colX[4], y);
    doc.text(String(line.tva), colX[5], y);
    y += 18;
  });

  // Totals
  doc.moveDown().moveDown();
  doc
    .font('Helvetica-Bold')
    .text(`Total HT: ${totals.totalHT.toFixed(2)} MAD`, { align: 'right' })
    .text(`TVA: ${totals.totalTVA.toFixed(2)} MAD`, { align: 'right' })
    .text(`Total TTC: ${totals.totalTTC.toFixed(2)} MAD`, { align: 'right' });

  // Footer
  doc.moveDown().fontSize(9).font('Helvetica').text('Merci pour votre confiance.', { align: 'center' });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const publicUrl = `/static/pdfs/${filename}`;
  return { filePath, publicUrl };
}