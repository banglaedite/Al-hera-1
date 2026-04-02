export const printElement = (elementId: string, size: 'A4' | 'A5' | 'auto' = 'auto') => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('hidden', 'absolute', 'top-0', 'left-0', 'print:hidden');
  clone.style.width = '100%';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.position = 'relative';
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Hind Siliguri', sans-serif; background: white; margin: 0; padding: 0; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @media print { 
              .no-print { display: none !important; } 
              @page { margin: 10mm; size: ${size}; }
              body { padding: 0; }
              /* Prevent unnecessary page breaks */
              tr, div, p { page-break-inside: avoid; }
              table { page-break-inside: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>
          <div class="w-full">${clone.outerHTML}</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
            setTimeout(() => {
              if (!window.closed) {
                window.print();
                window.close();
              }
            }, 3000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
