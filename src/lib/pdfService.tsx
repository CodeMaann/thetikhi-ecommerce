import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Order } from './orderService';
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import toast from 'react-hot-toast';

export async function downloadInvoicePdf(order: Order) {
  return new Promise<void>((resolve, reject) => {
    // 1. Create a hidden container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '200vw'; // move out of screen
    container.style.zIndex = '-100';
    document.body.appendChild(container);

    // 2. Render InvoiceTemplate into container
    const root = createRoot(container);
    root.render(<InvoiceTemplate order={order} />);

    // 3. Wait a moment for rendering to complete (especially fonts)
    setTimeout(async () => {
      try {
        const element = container.firstChild as HTMLElement;
        if (!element) throw new Error('Failed to render template');

        const canvas = await html2canvas(element, {
          scale: 2, // better resolution
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 format: 210 x 297 mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`TheTikhi-Invoice-${order.orderId}.pdf`);
        
        toast.success('Invoice downloaded successfully');
        resolve();
      } catch (err) {
        console.error('PDF Generation Error:', err);
        toast.error('Failed to generate PDF');
        reject(err);
      } finally {
        root.unmount();
        document.body.removeChild(container);
      }
    }, 500); // give 500ms for react render
  });
}
