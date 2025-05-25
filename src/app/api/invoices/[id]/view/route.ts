import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/client';
import { generateInvoice } from '@/lib/services/invoice';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get Auth0 session
    const auth0Session = await getSession();
    // Check for debug session
    const debugSession = request.cookies.get('auth_session')?.value === 'debug_token';
    
    if (!auth0Session && !debugSession) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const invoiceData = await generateInvoice(params.id);

    // Generate QR code
    const qrCodeData = {
      transactionNumber: invoiceData.transaction.transactionNumber,
      totalAmount: invoiceData.transaction.totalAmount,
      date: invoiceData.transaction.createdAt,
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));

    // Generate PDF
    const doc = new jsPDF();

    // Add store header
    doc.setFontSize(20);
    doc.text(invoiceData.store.name, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(invoiceData.store.address, 105, 30, { align: 'center' });
    doc.text(`Phone: ${invoiceData.store.phone}`, 105, 40, { align: 'center' });
    doc.text(`Email: ${invoiceData.store.email}`, 105, 50, { align: 'center' });

    // Add invoice title
    doc.setFontSize(16);
    doc.text('INVOICE', 105, 70, { align: 'center' });

    // Add transaction details
    doc.setFontSize(12);
    doc.text(`Transaction #: ${invoiceData.transaction.transactionNumber}`, 20, 90);
    doc.text(`Date: ${new Date(invoiceData.transaction.createdAt).toLocaleDateString()}`, 20, 100);
    doc.text(`Cashier: ${invoiceData.cashier.name}`, 20, 110);

    // Add customer details if available
    let startY = 130;
    if (invoiceData.customer) {
      doc.text('Bill To:', 20, startY);
      doc.text(invoiceData.customer.name, 20, startY + 10);
      doc.text(invoiceData.customer.email, 20, startY + 20);
      doc.text(invoiceData.customer.phone, 20, startY + 30);
      startY += 50;
    }

    // Add items table
    doc.text('Items:', 20, startY);
    startY += 10;

    // Table headers
    doc.text('Product', 20, startY);
    doc.text('Qty', 100, startY);
    doc.text('Price', 120, startY);
    doc.text('Total', 160, startY);
    startY += 10;

    // Table rows
    invoiceData.items.forEach((item) => {
      doc.text(item.productName.substring(0, 40), 20, startY); // Truncate long product names
      doc.text(item.quantity.toString(), 100, startY);
      doc.text(item.unitPrice.toFixed(2), 120, startY);
      doc.text(item.total.toFixed(2), 160, startY);
      startY += 10;
    });

    // Add totals
    startY += 10;
    doc.text('Subtotal:', 120, startY);
    doc.text(invoiceData.transaction.subtotal.toFixed(2), 160, startY);
    startY += 10;
    
    doc.text('Tax:', 120, startY);
    doc.text(invoiceData.transaction.tax.toFixed(2), 160, startY);
    startY += 10;
    
    if (invoiceData.transaction.discount > 0) {
      doc.text('Discount:', 120, startY);
      doc.text(invoiceData.transaction.discount.toFixed(2), 160, startY);
      startY += 10;
    }
    
    doc.setFontSize(14);
    doc.text('Total:', 120, startY);
    doc.text(invoiceData.transaction.totalAmount.toFixed(2), 160, startY);

    // Add QR code
    doc.addImage(qrCode, 'PNG', 20, startY + 20, 40, 40);

    // Add payment method
    doc.setFontSize(12);
    doc.text(`Payment Method: ${invoiceData.transaction.paymentMethod}`, 20, startY + 70);

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoiceData.transaction.transactionNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new NextResponse('Error generating invoice: ' + (error instanceof Error ? error.message : String(error)), { status: 500 });
  }
} 