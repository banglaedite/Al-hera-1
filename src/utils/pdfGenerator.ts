import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

export const generateMonthlyReceipt = (data: any, student: any, sendEmail: any, addToast: any) => {
    const doc = new jsPDF('p', 'mm', 'a5');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("AL HERA MADRASA", pageWidth / 2, 18, { align: "center" });
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
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", pageWidth / 2, 190, { align: "center" });
    
    const pdfData = doc.output('datauristring');
    const filename = `Receipt_${student.id}_${data.transaction_id}.pdf`;
    doc.save(filename);
    
    if (student.email) {
      sendEmail(pdfData, filename, student.email, addToast);
    } else {
      addToast("ছাত্রের ইমেইল অ্যাড্রেস নেই!", "error");
    }
};

export const generateReceipt = (fee: any, student: any, sendEmail: any, addToast: any) => {
    const doc = new jsPDF('p', 'mm', 'a5');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("AL HERA MADRASA", pageWidth / 2, 18, { align: "center" });
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
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", pageWidth / 2, 190, { align: "center" });
    
    const pdfData = doc.output('datauristring');
    const filename = `Receipt_${student.id}_${fee.id}.pdf`;
    doc.save(filename);
    
    if (student.email) {
      sendEmail(pdfData, filename, student.email, addToast);
    } else {
      addToast("ছাত্রের ইমেইল অ্যাড্রেস নেই!", "error");
    }
};

export const generateResultPDF = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  return pdf.output('datauristring');
};
