const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

function safeParseJSON(jsonString, defaultValue = {}) {
  try {
    if (typeof jsonString === 'object') return jsonString;
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('JSON Parsing Error:', error);
    console.log('Problematic JSON:', jsonString);
    return defaultValue;
  }
}

async function generatePDF(res, teacherId, examId) {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40  // Reduced margin to fit more content
    });

    doc.registerFont('Regular', 'assets/fonts/Inter-Regular.otf');
    doc.registerFont('Bold', 'assets/fonts/Inter-Bold.otf');

    const teacherQuery = `SELECT name FROM users WHERE user_id = $1 AND role = 'Teacher'`;
    const { rows: teacherRows } = await query(teacherQuery, [teacherId]);
    const teacherName = teacherRows[0]?.name || `Teacher ${teacherId}`;

    const filePath = `./Aptitude_Report_${teacherName}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.image('assets/atharva_logo.png', 40, 30, { width: 100 });
    doc.image('assets/csi_logo.jpg', 470, 30, { width: 70 });

     // Calculate page width for centering
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.moveDown(10);
    
    
    doc.font('Bold').fontSize(42);
    const aptitudeTextWidth = doc.widthOfString("Aptitude");
    doc.text("Aptitude", doc.page.margins.left + (pageWidth - aptitudeTextWidth) / 2, doc.y, { 
      width: aptitudeTextWidth, 
      align: 'center' 
    });

    
    const reportTextWidth = doc.widthOfString("Report");
    doc.text("Report", doc.page.margins.left + (pageWidth - reportTextWidth) / 2, null, { 
      width: reportTextWidth, 
      align: 'center' 
    });

    doc.moveDown(8);
    

    doc.font('Regular').fontSize(22);
    const teacherNameWidth = doc.widthOfString(teacherName);
    doc.text(teacherName, doc.page.margins.left + (pageWidth - teacherNameWidth) / 2, null, { 
      width: teacherNameWidth, 
      align: 'center' 
    });

    const resultQuery = `
      SELECT 
        q.question_id,
        q.question_text, 
        q.question_type, 
        q.options,
        q.correct_option,
        q.correct_options,
        tr.selected_option,
        tr.selected_options,
        tr.text_answer,
        tr.response_status,
        tr.response_id,
        tres.marks_allotted, 
        tres.max_score,
        tres.comments 
      FROM questions q
      LEFT JOIN teacher_responses tr ON tr.question_id = q.question_id 
        AND tr.teacher_id = $1 
        AND tr.exam_id = $2
      LEFT JOIN teacher_results tres ON tres.question_id = q.question_id 
        AND tres.teacher_id = $1 
        AND tres.exam_id = $2
      WHERE q.exam_id = $2
      ORDER BY q.question_id
    `;
    const result  = await query(resultQuery, [teacherId, examId]);
    const results = result.rows;

    doc.addPage();
    let currentPage = 1;

    doc.font('Bold').fontSize(18).text("Questions and Answers", { align: 'left' }).moveDown(0.5);

    results.forEach((row, index) => {
      // Check if we need a new page
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        currentPage++;
        doc.font('Bold').fontSize(18).text("Questions and Answers", { align: 'left' }).moveDown(0.5);
      }

      const maxScore = row.max_score || (row.question_type === 'text' ? 5 : 1);
      const marksAllotted = row.marks_allotted || 0;

      doc.font('Regular').fontSize(10).text("Marks", 500, doc.y, { width: 50, align: 'center' })
         .rect(500, doc.y + 15, 50, 25).stroke()
         .font('Bold').fontSize(12)
         .text(`${marksAllotted}/${maxScore}`, 500, doc.y + 20, { width: 50, align: 'center' });

      doc.moveDown(1);
      doc.font('Bold').fontSize(12).text(`Q${index + 1}) ${row.question_text}`, 40).moveDown(0.3);

      // Check if the question is not attempted
      const isNotAttempted = !row.selected_option && 
                             (!row.selected_options || row.selected_options === '[]') && 
                             !row.text_answer;

      if (row.question_type === 'single_choice' || row.question_type === 'multiple_choice') {
        const options = safeParseJSON(row.options);
        let hasSelectedOption = false;
        
        Object.entries(options).forEach(([key, value]) => {
          let optionText = `${key}) ${value}`;
          
          let highlightColor = 'black';
          let optionAnnotation = '';
          
          if (row.question_type === 'single_choice') {
            if (row.correct_option === key) {
              highlightColor = 'green';
              optionAnnotation = ' (Correct Answer)';
            }
            if (row.selected_option && row.selected_option !== row.correct_option && row.selected_option === key) {
              highlightColor = 'red';
            }
            if (row.selected_option === key) {
              hasSelectedOption = true;
            }
          } else if (row.question_type === 'multiple_choice') {
            const correctOptions = safeParseJSON(row.correct_options, []);
            const selectedOptions = safeParseJSON(row.selected_options, []);
            
            if (correctOptions.includes(key)) {
              highlightColor = 'green';
              optionAnnotation = ' (Correct Answer)';
            }
            if (selectedOptions.includes(key) && !correctOptions.includes(key)) {
              highlightColor = 'red';
            }
            if (selectedOptions.includes(key)) {
              hasSelectedOption = true;
            }
          }
          
          doc.fillColor(highlightColor)
             .font('Regular').fontSize(10)
             .text(optionText + optionAnnotation, 60);
          doc.fillColor('black');
        });

        // Add "NOT ATTEMPTED" if no option was selected
        if (isNotAttempted) {
          doc.moveDown(0.3);
          doc.fillColor('#002567')
             .font('Bold').fontSize(10)
             .text("NOT ATTEMPTED", 60);
          doc.fillColor('black');
        }
      }

      if (row.question_type === 'text') {
        doc.font('Regular').fontSize(10)
           .text("Ans: " + (row.text_answer ? row.text_answer.trim() : "No answer provided"), 40, null, { 
             width: 450, 
             align: 'justify'
           });
        
        if (row.comments) {
          doc.moveDown(0.3);
          doc.font('Bold').fontSize(9).fillColor('darkblue')
             .text(`Comment: ${row.comments}`, 40, null, { 
               width: 450, 
               align: 'left'
             });
        }

        // Add "NOT ATTEMPTED" for text questions
        if (isNotAttempted) {
          doc.moveDown(0.3);
          doc.fillColor('#002567')
             .font('Bold').fontSize(10)
             .text("NOT ATTEMPTED", 40);
          doc.fillColor('black');
        }
      }

      addFooter(doc, currentPage);
      
      doc.moveDown(1);
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
    console.error("Error generating PDF:", error);
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
  doc.circle(circleX, circleY, circleRadius).fill('#002567');

  doc.fillColor('white').font('Bold').fontSize(12)
     .text(`${pageNumber}`, circleX - 7, circleY - 7, { align: 'center', width: 14 });

  doc.fillColor('black');
}

module.exports = generatePDF;