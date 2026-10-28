
const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const conn = require('./conn.js');

// Download Excel report for a selected date
router.get('/download-visit-records', (req, res) => {
    const date = req.query.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).send('Please select a valid date.');
    }

    const sql = `
        SELECT TIME_FORMAT(v.time_visit, '%h:%i %p') AS visit_time, s.school_id,
        s.fullname, c.course_code, s.year_level
        FROM visits AS v INNER JOIN students AS s ON v.school_id = s.school_id
        INNER JOIN courses AS c ON s.course_id = c.course_id
        WHERE DATE(v.time_visit) = ?
        ORDER BY v.time_visit ASC
    `;

    conn.query(sql, [date], async (err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to retrieve visit records.');
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Visit Records');

            worksheet.columns = [
                { header: 'Time', key: 'visit_time', width: 18 },
                { header: 'School ID Number', key: 'school_id', width: 22 },
                { header: 'Full Name', key: 'fullname', width: 30 },
                { header: 'Course', key: 'course_code', width: 15 },
                { header: 'Year Level', key: 'year_level', width: 15 }
            ];

            worksheet.addRows(records);
            worksheet.getRow(1).font = { bold: true };

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="visit-records-${date}.xlsx"`
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.status(500).send('Failed to create Excel file.');
            }
        }
    });
});

// Page containing only the date filter and download button
router.get('/visit-records', (req, res) => {
    res.render('visit-records');
});

module.exports = router;
