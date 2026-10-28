
const express = require('express');
const router = express.Router();

const conn = require('./conn.js');

// Record a visit from the ID scanner
router.post('/scanner-visit', (req, res) => {
    const school_id = req.body.school_id;

    if (!/^\d{2}-\d{4}-\d{6}$/.test(school_id || '')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid student ID format.'
        });
    }

    conn.query(
        'SELECT * FROM students WHERE school_id = ?',
        [school_id],
        (err, students) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error.'
                });
            }

            if (students.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found.'
                });
            }

            const student = students[0];

            conn.query(
                `INSERT INTO visits
                (school_id, student_course, time_visit)
                VALUES (?, ?, NOW())`,
                [student.school_id, student.course_id],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: 'Unable to record visit.'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Visit recorded successfully!',
                        student: {
                            school_id: student.school_id,
                            fullname: student.fullname
                        }
                    });
                }
            );
        }
    );
});

module.exports = router;
