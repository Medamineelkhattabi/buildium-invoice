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

function numberToWords(num) {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  if (num === 0) return 'zéro';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit ? '-' + units[unit] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return (hundred > 1 ? units[hundred] + ' ' : '') + 'cent' + (rest ? ' ' + numberToWords(rest) : '');
  }
  
  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;
  return numberToWords(thousand) + ' mille' + (rest ? ' ' + numberToWords(rest) : '');
}

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

  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Couleurs élégantes
  const primaryColor = '#2c3e50';
  const accentColor = '#34495e';
  const lightGray = '#f8f9fa';
  const borderColor = '#dee2e6';
  const textColor = '#212529';

  // === EN-TÊTE AVEC LOGO ===
  // Bande supérieure
  doc.rect(0, 0, 595, 100)
     .fillAndStroke(lightGray, borderColor);

  // Logo ou nom de l'entreprise
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 40, 15, { width: 70, height: 70 });
    } catch (error) {
      doc.fillColor(primaryColor)
         .fontSize(20)
         .font('Times-Bold')
         .text('BUILDIUM', 40, 35);
    }
  } else {
    doc.fillColor(primaryColor)
       .fontSize(22)
       .font('Times-Bold')
       .text('BUILDIUM', 40, 25);
    
    doc.fontSize(9)
       .font('Times-Roman')
       .fillColor(accentColor)
       .text('S.A.R.L', 40, 50);
  }

  // Informations entreprise (centre-gauche)
  doc.fillColor(textColor)
     .fontSize(8)
     .font('Times-Roman')
     .text(SENDER_FIXED.address, 140, 20, { width: 180, lineGap: 1 })
     .text(`ICE: ${SENDER_FIXED.ice}`, 140, 40)
     .text(`RC: ${SENDER_FIXED.rc}`, 140, 52)
     .text(`Tél: ${SENDER_FIXED.phone}`, 140, 64)
     .text(`Email: ${SENDER_FIXED.email}`, 140, 76);

  // Titre FACTURE (à droite)
  doc.fillColor(primaryColor)
     .fontSize(26)
     .font('Times-Bold')
     .text('FACTURE', 420, 25);

  // Encadré numéro et date
  doc.rect(420, 55, 140, 35)
     .fillAndStroke(primaryColor, primaryColor);

  doc.fillColor('white')
     .fontSize(10)
     .font('Times-Bold')
     .text(`N° ${invoiceNumber}`, 430, 62)
     .fontSize(8)
     .font('Times-Roman')
     .text(`Date: ${dayjs(date).format('DD/MM/YYYY')}`, 430, 76);

  // === SECTION INFORMATIONS ===
  let currentY = 120;

  // Cadres émetteur et destinataire
  const boxHeight = 90;
  const leftBoxX = 40;
  const rightBoxX = 310;
  const boxWidth = 240;

  // Cadre émetteur
  doc.rect(leftBoxX, currentY, boxWidth, boxHeight)
     .fillAndStroke('white', borderColor);

  doc.fillColor(primaryColor)
     .fontSize(10)
     .font('Times-Bold')
     .text('ÉMETTEUR', leftBoxX + 8, currentY + 8);

  doc.fillColor(textColor)
     .fontSize(8)
     .font('Times-Bold')
     .text(SENDER_FIXED.name, leftBoxX + 8, currentY + 22)
     .font('Times-Roman')
     .text(`ID Fiscale: ${SENDER_FIXED.taxId}`, leftBoxX + 8, currentY + 34)
     .text(SENDER_FIXED.address, leftBoxX + 8, currentY + 46, { width: 220, lineGap: 1 })
     .text(`Tél: ${SENDER_FIXED.phone}`, leftBoxX + 8, currentY + 70);

  // Cadre destinataire
  doc.rect(rightBoxX, currentY, boxWidth, boxHeight)
     .fillAndStroke('white', borderColor);

  doc.fillColor(primaryColor)
     .fontSize(10)
     .font('Times-Bold')
     .text('DESTINATAIRE', rightBoxX + 8, currentY + 8);

  doc.fillColor(textColor)
     .fontSize(8)
     .font('Times-Bold')
     .text(supplier.name, rightBoxX + 8, currentY + 22)
     .font('Times-Roman')
     .text(supplier.address, rightBoxX + 8, currentY + 34, { width: 220, lineGap: 1 })
     .text(`ICE: ${supplier.ice}`, rightBoxX + 8, currentY + 52)
     .text(`Contact: ${supplier.contact}`, rightBoxX + 8, currentY + 64)
     .text(`Tél: ${supplier.phone}`, rightBoxX + 8, currentY + 76);

  currentY += boxHeight + 25;

  // === TABLEAU DES ARTICLES ===
  const tableTop = currentY;
  const tableLeft = 40;
  const tableWidth = 515;

  // En-tête du tableau
  doc.rect(tableLeft, tableTop, tableWidth, 25)
     .fillAndStroke(primaryColor, primaryColor);

  // Colonnes ajustées
  const colWidths = [70, 240, 40, 70, 95];
  const colPositions = [tableLeft];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }

  // En-têtes
  doc.fillColor('white')
     .fontSize(8)
     .font('Times-Bold')
     .text('RÉFÉRENCE', colPositions[0] + 4, tableTop + 8)
     .text('DÉSIGNATION', colPositions[1] + 4, tableTop + 8)
     .text('QTÉ', colPositions[2] + 4, tableTop + 8)
     .text('P.U. HT', colPositions[3] + 4, tableTop + 8)
     .text('TOTAL HT', colPositions[4] + 4, tableTop + 8);

  // Lignes du tableau
  currentY = tableTop + 25;
  doc.fillColor(textColor).font('Times-Roman').fontSize(7);

  lines.forEach((line, index) => {
    const rowHeight = 30;
    const bgColor = index % 2 === 0 ? 'white' : '#f8f9fa';
    
    // Fond alterné
    doc.rect(tableLeft, currentY, tableWidth, rowHeight)
       .fillAndStroke(bgColor, borderColor);

    // Lignes verticales
    colPositions.forEach(pos => {
      doc.moveTo(pos, currentY)
         .lineTo(pos, currentY + rowHeight)
         .strokeColor(borderColor)
         .lineWidth(0.5)
         .stroke();
    });
    
    doc.moveTo(tableLeft + tableWidth, currentY)
       .lineTo(tableLeft + tableWidth, currentY + rowHeight)
       .stroke();

    // Contenu
    const ptHT = line.quantity * line.unitPriceHT;
    
    doc.fillColor(textColor)
       .font('Times-Bold')
       .fontSize(7)
       .text(line.reference, colPositions[0] + 4, currentY + 8, { width: colWidths[0] - 8 })
       .font('Times-Roman')
       .text(line.designation, colPositions[1] + 4, currentY + 8, { width: colWidths[1] - 8, lineGap: 1 })
       .text(line.quantity.toFixed(2), colPositions[2] + 4, currentY + 12, { width: colWidths[2] - 8, align: 'center' })
       .text(`${line.unitPriceHT.toFixed(2)}`, colPositions[3] + 4, currentY + 12, { width: colWidths[3] - 8, align: 'right' })
       .font('Times-Bold')
       .text(`${ptHT.toFixed(2)}`, colPositions[4] + 4, currentY + 12, { width: colWidths[4] - 8, align: 'right' });

    currentY += rowHeight;
  });

  // Bordure finale
  doc.moveTo(tableLeft, currentY)
     .lineTo(tableLeft + tableWidth, currentY)
     .strokeColor(primaryColor)
     .lineWidth(1)
     .stroke();

  // === SECTION TOTAUX ===
  currentY += 15;
  const totalsLeft = 360;
  const totalsWidth = 195;

  // Cadre totaux
  doc.rect(totalsLeft, currentY, totalsWidth, 80)
     .fillAndStroke(lightGray, borderColor);

  // En-tête totaux
  doc.rect(totalsLeft, currentY, totalsWidth, 20)
     .fillAndStroke(accentColor, accentColor);

  doc.fillColor('white')
     .fontSize(9)
     .font('Times-Bold')
     .text('RÉCAPITULATIF', totalsLeft + 8, currentY + 6);

  // Détail des totaux
  doc.fillColor(textColor)
     .fontSize(8)
     .font('Times-Roman')
     .text('Total HT:', totalsLeft + 10, currentY + 28)
     .text(`${totals.totalHT.toFixed(2)} MAD`, totalsLeft + 80, currentY + 28, { align: 'right', width: 100 })
     .text('TVA (20%):', totalsLeft + 10, currentY + 42)
     .text(`${totals.totalTVA.toFixed(2)} MAD`, totalsLeft + 80, currentY + 42, { align: 'right', width: 100 });

  // Total TTC
  doc.rect(totalsLeft + 5, currentY + 55, totalsWidth - 10, 20)
     .fillAndStroke(primaryColor, primaryColor);

  doc.fillColor('white')
     .fontSize(9)
     .font('Times-Bold')
     .text('TOTAL TTC:', totalsLeft + 12, currentY + 62)
     .text(`${totals.totalTTC.toFixed(2)} MAD`, totalsLeft + 80, currentY + 62, { align: 'right', width: 95 });

  // Montant en lettres
  currentY += 100;
  const amountInWords = numberToWords(Math.floor(totals.totalTTC));
  
  doc.rect(40, currentY, 515, 25)
     .fillAndStroke('#f0f4f8', borderColor);

  doc.fillColor(textColor)
     .fontSize(8)
     .font('Times-Bold')
     .text('Montant en lettres: ', 48, currentY + 8)
     .font('Times-Italic')
     .text(`${amountInWords} dirhams`, 130, currentY + 8);

  // === PIED DE PAGE ===
  currentY += 45;

  // Ligne de séparation
  doc.moveTo(40, currentY)
     .lineTo(555, currentY)
     .strokeColor(accentColor)
     .lineWidth(1)
     .stroke();

  currentY += 10;

  // Informations légales
  doc.fillColor(textColor)
     .fontSize(7)
     .font('Times-Roman')
     .text(`${SENDER_FIXED.name} - ICE: ${SENDER_FIXED.ice} - RC: ${SENDER_FIXED.rc}`, 40, currentY)
     .text(`ID Fiscale: ${SENDER_FIXED.taxId} - Email: ${SENDER_FIXED.email}`, 40, currentY + 10)
     .text(`Adresse: ${SENDER_FIXED.address}`, 40, currentY + 20);

  // Zone signature
  doc.rect(450, currentY + 10, 100, 60)
     .fillAndStroke('white', borderColor);

  doc.fillColor(accentColor)
     .fontSize(7)
     .font('Times-Bold')
     .text('CACHET ET', 470, currentY + 25, { align: 'center', width: 60 })
     .text('SIGNATURE', 470, currentY + 35, { align: 'center', width: 60 });

  // Message final
  doc.fillColor(primaryColor)
     .fontSize(8)
     .font('Times-Italic')
     .text('Merci pour votre confiance', 40, 750, { align: 'center', width: 515 });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const publicUrl = `/static/pdfs/${filename}`;
  return { filePath, publicUrl };
}