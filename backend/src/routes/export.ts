import { Router, Request, Response } from 'express';

const router = Router();

router.post('/export/pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { notebook_content, graphs } = req.body as {
      notebook_content: string;
      graphs: string[];
    };

    if (!notebook_content) {
      res.status(400).json({ error: 'notebook_content is required' });
      return;
    }

    // Dynamic import for jsPDF (ESM compat)
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const margin = 20;
    let y = margin;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text('AI Math Agent - Notebook Export', margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Exported on ${new Date().toLocaleString()}`, margin, y);
    y += 15;

    doc.setTextColor(0);
    doc.setFontSize(11);

    const lines = notebook_content.split('\n');
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      if (line.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(line.slice(2), margin, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        y += lineHeight + 4;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(line.slice(3), margin, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        y += lineHeight + 3;
      } else {
        const wrapped = doc.splitTextToSize(line || ' ', maxWidth);
        for (const wLine of wrapped) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(wLine, margin, y);
          y += lineHeight;
        }
      }
    }

    // Add graphs
    if (graphs && graphs.length > 0) {
      for (const img of graphs) {
        doc.addPage();
        y = margin;
        try {
          doc.addImage(img, 'PNG', margin, y, maxWidth, maxWidth * 0.6);
        } catch {
          doc.text('[Graph could not be rendered]', margin, y);
        }
      }
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="notebook-export.pdf"');
    res.send(pdfBuffer);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'PDF generation failed';
    console.error('PDF export error:', msg);
    res.status(500).json({ error: msg });
  }
});

export default router;
