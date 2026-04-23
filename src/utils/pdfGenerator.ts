import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

// Helper to add signature
const addSignature = async (doc: any, settings: any, y: number, pageWidth: number) => {
    if (settings?.show_muhtamim_signature === 1 && settings?.muhtamim_signature_url) {
        try {
            const sigImg = new Image();
            sigImg.crossOrigin = "Anonymous";
            sigImg.src = settings.muhtamim_signature_url;
            await new Promise((resolve, reject) => {
                sigImg.onload = resolve;
                sigImg.onerror = reject;
            });
            // Make signature bigger and explicitly positioned
            doc.addImage(sigImg, 'PNG', pageWidth - 45, y, 30, 15);
            doc.setFontSize(8);
            doc.text("মুহতামিম", pageWidth - 30, y + 20, { align: "center" });
        } catch (e) {
            console.error("Failed to add signature to PDF", e);
        }
    }
};

export const generateMonthlyReceipt = async (data: any, student: any, sendEmail: any, addToast: any, settings?: any) => {
    const doc = new jsPDF('p', 'mm', 'a5');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(settings?.title || "AL HERA MADRASA", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(8);
    doc.text("Monthly Fee Receipt", pageWidth / 2, 24, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Receipt No: ${data.transaction_id}`, margin, 45);
    doc.text(`Date: ${new Date(data.paid_date).toLocaleDateString()}`, pageWidth - margin, 45, { align: "right" });
    
    doc.setFontSize(12);
    doc.text("Student Information", margin, 58);
    doc.setFontSize(9);
    doc.text(`Name: ${student.name}`, margin, 66);
    doc.text(`ID: ${student.id}`, margin, 71);
    doc.text(`Class: ${student.class}`, margin, 76);
    doc.text(`Roll: ${student.roll}`, margin, 81);
    
    (doc as any).autoTable({
      startY: 90,
      margin: { left: margin, right: margin },
      head: [["Category", "Months", "Year", "Amount"]],
      body: [
        ["Monthly Fee", data.months.join(", "), data.year, `BDT ${data.amount}`]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] },
      styles: { fontSize: 8 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text("Total Paid:", pageWidth - margin - 40, finalY);
    doc.setFontSize(12);
    doc.text(`BDT ${data.amount}.00`, pageWidth - margin, finalY, { align: "right" });
    
    // QR Code Integration
    if (settings?.qr_code_url) {
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = "Anonymous";
        qrImg.src = settings.qr_code_url;
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
        });
        doc.addImage(qrImg, 'PNG', margin, finalY + 10, 25, 25);
      } catch (e) {
        console.error("Failed to add QR code to PDF", e);
      }
    }
    
    // Add Signature
    await addSignature(doc, settings, finalY + 10, pageWidth - margin);
    
    const pdfData = doc.output('datauristring');
    const filename = `Receipt_${student.id}_${data.transaction_id}.pdf`;
    doc.save(filename);
    
    if (student.email) {
      sendEmail(pdfData, filename, student.email, addToast);
    } else {
      const manualEmail = window.prompt("ছাত্রের ইমেইল অ্যাড্রেস নেই! দয়া করে ইমেইল অ্যাড্রেসটি দিন:", "");
      if (manualEmail) {
        sendEmail(pdfData, filename, manualEmail, addToast);
      }
    }
};

export const generateReceipt = async (fee: any, student: any, sendEmail: any, addToast: any, settings?: any) => {
    const doc = new jsPDF('p', 'mm', 'a5');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(settings?.title || "AL HERA MADRASA", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(8);
    doc.text("Digital Payment Receipt", pageWidth / 2, 24, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Receipt No: ${fee.transaction_id}`, margin, 45);
    doc.text(`Date: ${new Date(fee.paid_date).toLocaleDateString()}`, pageWidth - margin, 45, { align: "right" });
    
    doc.setFontSize(12);
    doc.text("Student Information", margin, 58);
    doc.setFontSize(9);
    doc.text(`Name: ${student.name}`, margin, 66);
    doc.text(`ID: ${student.id}`, margin, 71);
    doc.text(`Class: ${student.class}`, margin, 76);
    doc.text(`Roll: ${student.roll}`, margin, 81);
    
    (doc as any).autoTable({
      startY: 90,
      margin: { left: margin, right: margin },
      head: [["Category", "Amount", "Status"]],
      body: [
        [fee.category, `BDT ${fee.amount}`, fee.status.toUpperCase()]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] },
      styles: { fontSize: 8 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text("Total Paid:", pageWidth - margin - 40, finalY);
    doc.setFontSize(12);
    doc.text(`BDT ${fee.amount}.00`, pageWidth - margin, finalY, { align: "right" });
    
    // QR Code Integration
    if (settings?.qr_code_url) {
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = "Anonymous";
        qrImg.src = settings.qr_code_url;
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
        });
        doc.addImage(qrImg, 'PNG', margin, finalY + 10, 25, 25);
      } catch (e) {
        console.error("Failed to add QR code to PDF", e);
      }
    }
    
    // Add Signature
    await addSignature(doc, settings, finalY + 10, pageWidth - margin);
    
    const pdfData = doc.output('datauristring');
    const filename = `Receipt_${student.id}_${fee.id}.pdf`;
    doc.save(filename);
    
    if (student.email) {
      sendEmail(pdfData, filename, student.email, addToast);
    } else {
      const manualEmail = window.prompt("ছাত্রের ইমেইল অ্যাড্রেস নেই! দয়া করে ইমেইল অ্যাড্রেসটি দিন:", "");
      if (manualEmail) {
        sendEmail(pdfData, filename, manualEmail, addToast);
      }
    }
};

export const generateResultPDF = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  // Use a temporary container to style for PDF
  const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  // A4 size: 210mm x 297mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Maintain aspect ratio and fit to A4
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  
  const finalWidth = pdfWidth - 20; // 10mm margin
  const finalHeight = finalWidth / ratio;
  
  // If too tall, scale down
  if (finalHeight > pdfHeight - 20) {
      const scale = (pdfHeight - 20) / finalHeight;
      pdf.addImage(imgData, 'PNG', 10, 10, finalWidth * scale, finalHeight * scale);
  } else {
      pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
  }
  
  return pdf.output('datauristring');
};
