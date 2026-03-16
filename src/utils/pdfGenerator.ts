import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

export const generateMonthlyReceipt = (data: any, student: any, sendEmail: any, addToast: any) => {
    const doc = new jsPDF();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("AL HERA MADRASA", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Monthly Fee Receipt", 105, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt No: ${data.transaction_id}`, 20, 55);
    doc.text(`Date: ${new Date(data.paid_date).toLocaleDateString()}`, 150, 55);

    doc.setFontSize(14);
    doc.text("Student Information", 20, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${student.name}`, 20, 80);
    doc.text(`ID: ${student.id}`, 20, 85);
    doc.text(`Class: ${student.class}`, 20, 90);
    doc.text(`Roll: ${student.roll}`, 20, 95);

    (doc as any).autoTable({
      startY: 110,
      head: [["Category", "Months", "Year", "Amount", "Transaction ID"]],
      body: [
        ["Monthly Fee", data.months.join(", "), data.year, `BDT ${data.amount}`, data.transaction_id]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Total Paid:", 140, finalY);
    doc.setFontSize(16);
    doc.text(`BDT ${data.amount}.00`, 170, finalY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

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
    const doc = new jsPDF();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("AL HERA MADRASA", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Digital Payment Receipt", 105, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt No: ${fee.transaction_id}`, 20, 55);
    doc.text(`Date: ${new Date(fee.paid_date).toLocaleDateString()}`, 150, 55);

    doc.setFontSize(14);
    doc.text("Student Information", 20, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${student.name}`, 20, 80);
    doc.text(`ID: ${student.id}`, 20, 85);
    doc.text(`Class: ${student.class}`, 20, 90);
    doc.text(`Roll: ${student.roll}`, 20, 95);

    (doc as any).autoTable({
      startY: 110,
      head: [["Category", "Amount", "Status", "Transaction ID"]],
      body: [
        [fee.category, `BDT ${fee.amount}`, fee.status.toUpperCase(), fee.transaction_id]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Total Paid:", 140, finalY);
    doc.setFontSize(16);
    doc.text(`BDT ${fee.amount}.00`, 170, finalY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

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
