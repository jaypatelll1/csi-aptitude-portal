const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function generatePDF(res, teacherId, examId) {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 60
    });

    const filePath = `./Aptitude_Report_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.registerFont('Regular', 'assets/fonts/Inter-Regular.otf');
    doc.registerFont('Bold', 'assets/fonts/Inter-Bold.otf');

    const teacherQuery = `SELECT name FROM users WHERE user_id = $1 AND role = 'Teacher'`;
    const { rows: teacherRows } = await query(teacherQuery, [teacherId]);
    const teacherName = teacherRows[0]?.name || `Teacher ${teacherId}`;

    // COVER PAGE
    doc.image('assets/atharva_logo.png', 60, 30, { width: 120 });
    doc.image('assets/csi_logo.jpg', 440, 30, { width: 80 });

    doc.moveDown(10);
    doc.font('Bold').fontSize(42).text("Aptitude", { align: 'center' });
    doc.font('Bold').fontSize(42).text("Report", { align: 'center' });

    doc.moveDown(8);
    doc.font('Regular').fontSize(22).text(teacherName, { align: 'center' });

    const resultQuery = `
      SELECT q.question_text, q.question_type, r.text_answer, 
             tr.marks_allotted, tr.max_score, tr.comments 
      FROM teacher_responses r 
      JOIN questions q ON q.question_id = r.question_id 
      LEFT JOIN teacher_results tr 
      ON tr.question_id = q.question_id 
      AND tr.teacher_id = r.teacher_id 
      AND tr.exam_id = r.exam_id 
      WHERE r.teacher_id = $1 AND r.exam_id = $2
    `;
    const { rows: results } = await query(resultQuery, [teacherId, examId]);

    // QUESTIONS & ANSWERS PAGE
    doc.addPage();
    let currentPage = 1;

    doc.font('Bold').fontSize(20).text("Questions and Answers", { align: 'left' }).moveDown(1);

    results.forEach((row, index) => {
      // Marks table
      doc.font('Regular').fontSize(12).text("Marks", 500, doc.y, { width: 50, align: 'center' })
         .rect(500, doc.y + 20, 50, 30).stroke()
         .font('Bold').fontSize(14)
         .text(`${row.marks_allotted || "1"}/${row.max_score || "5"}`, 500, doc.y + 25, { width: 50, align: 'center' });

      // Question
      doc.moveDown(2);
      doc.font('Bold').fontSize(14).text(`Q${index + 1}) ${row.question_text}`, 60).moveDown(0.5);

      // Answer
      doc.font('Regular').fontSize(12).text("Ans:", 60);
      doc.font('Regular').fontSize(12)
         .text(row.text_answer || "No answer provided", { width: 450, align: 'justify', indent: 60 }).moveDown(0.5);

      // Comment
      doc.font('Regular').fontSize(12).text("Comment:", 60);
      doc.font('Regular').fontSize(12)
         .text(row.comments || "No comments", { width: 450, align: 'justify', indent: 60 });

      // Footer with page number
      addFooter(doc, currentPage);
      
      // Move down for next question
      doc.moveDown(2);

      // Add new page if needed
      if (index < results.length - 1 && doc.y > doc.page.height - 120) {
        doc.addPage();
        currentPage++;
      }
    });

    doc.end();

    stream.on('finish', () => {
      if (res) {
        res.download(filePath, () => fs.unlinkSync(filePath));
      } else {
        console.log(`PDF saved to ${filePath}`);
      }
    });

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    if (res) {
      res.status(500).send("Error generating PDF");
    }
  }
}

function addFooter(doc, pageNumber) {
  const pageHeight = doc.page.height - doc.page.margins.bottom;

  const circleX = doc.page.width - 50;
  const circleY = pageHeight - 15;
  const circleRadius = 16;
  doc.circle(circleX, circleY, circleRadius).fill('#1a237e');

  doc.fillColor('white').font('Bold').fontSize(12)
     .text(`${pageNumber}`, circleX - 7, circleY - 7, { align: 'center', width: 14 });

  doc.fillColor('black');
}

module.exports = generatePDF;
