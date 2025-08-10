import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function exportToExcel(invoices, format = 'xlsx') {
  // Préparer les données pour l'export
  const data = invoices.map(invoice => ({
    'Numéro': invoice.invoiceNumber,
    'Date': dayjs(invoice.createdAt).format('DD/MM/YYYY'),
    'Client': invoice.supplier.name,
    'Adresse': invoice.supplier.address,
    'ICE': invoice.supplier.ice,
    'Téléphone': invoice.supplier.phone,
    'Email': invoice.supplier.email,
    'Contact': invoice.supplier.contact,
    'Statut': invoice.status === 'pending' ? 'En Attente' : 
              invoice.status === 'resolved' ? 'Résolue' : 'Non Résolue',
    'Total HT': invoice.totals.totalHT,
    'TVA': invoice.totals.totalTVA,
    'Total TTC': invoice.totals.totalTTC,
    'Nombre de lignes': invoice.lines.length
  }));

  // Créer le workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 15 }, // Numéro
    { wch: 12 }, // Date
    { wch: 25 }, // Client
    { wch: 30 }, // Adresse
    { wch: 18 }, // ICE
    { wch: 15 }, // Téléphone
    { wch: 25 }, // Email
    { wch: 20 }, // Contact
    { wch: 12 }, // Statut
    { wch: 12 }, // Total HT
    { wch: 10 }, // TVA
    { wch: 12 }, // Total TTC
    { wch: 8 }   // Nb lignes
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Factures');

  // Générer le fichier
  const exportsDir = path.join(__dirname, '..', 'storage', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const filename = `factures_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.${format}`;
  const filePath = path.join(exportsDir, filename);

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    fs.writeFileSync(filePath, csv);
  } else {
    XLSX.writeFile(wb, filePath);
  }

  return {
    filename,
    filePath,
    publicUrl: `/static/exports/${filename}`
  };
}

export function generateRevenueReport(invoices, period = 'monthly') {
  const revenueData = {};
  
  invoices.forEach(invoice => {
    const date = dayjs(invoice.createdAt);
    let key;
    
    if (period === 'monthly') {
      key = date.format('YYYY-MM');
    } else if (period === 'yearly') {
      key = date.format('YYYY');
    } else {
      key = date.format('YYYY-MM-DD');
    }
    
    if (!revenueData[key]) {
      revenueData[key] = {
        period: key,
        totalHT: 0,
        totalTTC: 0,
        totalTVA: 0,
        count: 0,
        pending: 0,
        resolved: 0,
        notResolved: 0,
        avgAmount: 0,
        clients: new Set()
      };
    }
    
    revenueData[key].totalHT += invoice.totals.totalHT;
    revenueData[key].totalTTC += invoice.totals.totalTTC;
    revenueData[key].totalTVA += invoice.totals.totalTVA;
    revenueData[key].count += 1;
    revenueData[key].clients.add(invoice.supplier.name);
    revenueData[key][invoice.status === 'pending' ? 'pending' : 
                     invoice.status === 'resolved' ? 'resolved' : 'notResolved'] += 1;
  });
  
  const result = Object.values(revenueData).map(item => ({
    ...item,
    avgAmount: item.count > 0 ? item.totalTTC / item.count : 0,
    uniqueClients: item.clients.size,
    clients: undefined
  }));
  
  return result.sort((a, b) => a.period.localeCompare(b.period));
}

export function generateAdvancedAnalytics(invoices) {
  const analytics = {
    topClients: {},
    paymentAnalysis: {
      pending: { count: 0, amount: 0 },
      resolved: { count: 0, amount: 0 },
      notResolved: { count: 0, amount: 0 }
    },
    trends: {
      avgInvoiceValue: 0,
      totalRevenue: 0,
      growthRate: 0
    }
  };
  
  invoices.forEach(invoice => {
    const clientName = invoice.supplier.name;
    if (!analytics.topClients[clientName]) {
      analytics.topClients[clientName] = {
        name: clientName,
        totalAmount: 0,
        invoiceCount: 0,
        avgAmount: 0
      };
    }
    analytics.topClients[clientName].totalAmount += invoice.totals.totalTTC;
    analytics.topClients[clientName].invoiceCount += 1;
    
    const status = invoice.status || 'pending';
    analytics.paymentAnalysis[status].count += 1;
    analytics.paymentAnalysis[status].amount += invoice.totals.totalTTC;
  });
  
  analytics.topClients = Object.values(analytics.topClients)
    .map(client => ({
      ...client,
      avgAmount: client.totalAmount / client.invoiceCount
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
  
  analytics.trends.totalRevenue = invoices.reduce((sum, inv) => sum + inv.totals.totalTTC, 0);
  analytics.trends.avgInvoiceValue = invoices.length > 0 ? analytics.trends.totalRevenue / invoices.length : 0;
  
  const sixMonthsAgo = dayjs().subtract(6, 'month');
  const twelveMonthsAgo = dayjs().subtract(12, 'month');
  
  const recentRevenue = invoices
    .filter(inv => dayjs(inv.createdAt).isAfter(sixMonthsAgo))
    .reduce((sum, inv) => sum + inv.totals.totalTTC, 0);
    
  const previousRevenue = invoices
    .filter(inv => {
      const date = dayjs(inv.createdAt);
      return date.isAfter(twelveMonthsAgo) && date.isBefore(sixMonthsAgo);
    })
    .reduce((sum, inv) => sum + inv.totals.totalTTC, 0);
    
  analytics.trends.growthRate = previousRevenue > 0 ? 
    ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  return analytics;
}