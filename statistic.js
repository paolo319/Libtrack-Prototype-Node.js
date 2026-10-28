
const express = require('express');
const router = express.Router();

const conn = require('./conn.js');

router.get('/statistics', (req, res) => {

    // WEEKLY: Monday to Sunday
    const weeklySQL = `
        SELECT WEEKDAY(time_visit) AS weekday_index, COUNT(*) AS total
        FROM visits WHERE time_visit >= DATE_SUB(
        CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND time_visit < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
        GROUP BY WEEKDAY(time_visit);
    `;

    conn.query(weeklySQL, (err, weeklyVisits) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Unable to load weekly visits.');
        }

        // MONTHLY: January to December of the current year
        const monthlySQL = `
            SELECT MONTH(time_visit) - 1 AS month_index, COUNT(*) AS total
            FROM visits
            WHERE YEAR(time_visit) = YEAR(CURDATE())
            GROUP BY MONTH(time_visit);
        `;

        conn.query(monthlySQL, (err, monthlyVisits) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Unable to load monthly visits.');
            }

            // OVERALL: Every course, including courses with zero visits
            const courseSQL = `
                SELECT c.course_code, c.course_name, COUNT(v.visit_id) AS total FROM courses AS c
                LEFT JOIN students AS s ON c.course_id = s.course_id
                LEFT JOIN visits AS v ON s.school_id = v.school_id
                GROUP BY c.course_id, c.course_code, c.course_name
                ORDER BY total ASC, c.course_code ASC;
            `;

            conn.query(courseSQL, (err, courseVisits) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Unable to load course visits.');
                }

                res.render('statistics', {
                    weeklyVisits,
                    monthlyVisits,
                    courseVisits
                });
            });
        });
    });
});

module.exports = router;
