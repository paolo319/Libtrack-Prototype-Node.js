
const express = require('express');
const libtrack = express();

libtrack.set('view engine', 'ejs');
libtrack.use(express.static('public'));
libtrack.use(express.urlencoded({ extended: true }));

const conn = require('./conn.js');

libtrack.use(express.json());
const scannerRoutes = require('./scannerRoutes');
const statisticsRoutes = require('./statistic');
libtrack.use(statisticsRoutes);
libtrack.use(require('./visit-records.js'));


libtrack.use(scannerRoutes);

libtrack.get('/', (req, res) => {
    res.render('landing-page');
});

libtrack.get('/login', (req, res) => {
    res.render('login');
});

// ========= FOR LOGIN LOGIC =========
libtrack.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    conn.query(
        "SELECT * FROM user_acc WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) {
                return res.send("Database error");
            }

            if (results.length > 0) {
                console.log("SUCCESSFULLY LOGGED IN!");
                res.redirect('/admin-dashboard');
            } else {
                res.send(`<script>
                    alert('Invalid username or password');
                    location.href='/login';
                </script>`);
                console.log("Invalid login attempt");
            }
        }
    );
});


libtrack.get('/admin-reg', (req, res) => {
    res.render('admin-reg');
});

// ========= FOR ADMIN REGISTRATION =========
libtrack.post('/admin-reg', (req, res) => {
    const univ = req.body.univ;
    const ln = req.body.ln;
    const fn = req.body.fn;
    const user = req.body.user;
    const pass = req.body.pass;

    const sql = `
        INSERT INTO user_acc
        (university, firstname, lastname, username, password)
        VALUES (?, ?, ?, ?, ?)
    `;

    conn.query(sql, [univ, fn, ln, user, pass], (err) => {
        if (err) {
            return res.send("Registration failed");
        }

        console.log("INSERT SUCCESS");
        res.send(`<script>
            alert('Registered Successfully!');
            location.href='/login';
        </script>`);
    });
});

//Paolo
libtrack.get('/admin-dashboard', (req, res) => {
    // const sql = `
    //     SELECT v.school_id, s.fullname, c.course_code, s.year_level, v.time_visit
    //     FROM visits AS v JOIN students AS s 
    //     ON v.school_id = s.school_id
    //     JOIN courses AS c ON s.course_id = c.course_id
    //     ORDER BY v.time_visit DESC;
    // `;
    const sql = `SELECT
        v.time_visit,
        s.school_id,
        s.fullname,
        c.course_code,
        s.year_level
        FROM visits AS v
        INNER JOIN students AS s
        ON v.school_id = s.school_id
        INNER JOIN courses AS c
        ON s.course_id = c.course_id
        WHERE DATE(v.time_visit) = CURDATE()
        ORDER BY v.time_visit DESC
`;

    conn.query(sql, (err, students) => {
        if (err) {
            console.log(err);
            return res.send("Unable to load recent visits.");
        }

        res.render('admin-dashboard', {
            students: students
        });
    });
});

// ========= FOR ADDING STUDENT VISITS =========
libtrack.post('/add-student', (req, res) => {

    const school_id = req.body.school_id;

    // Find the student
    conn.query(
        'SELECT * FROM students WHERE school_id = ?',
        [school_id],
        (err, students) => {

            if (err) return res.send("Database error");

            if (students.length === 0) {
                return res.send("School ID not found");
            }

            const student = students[0];

            // Record the visit
            conn.query(
                `INSERT INTO visits (school_id, student_course, time_visit)
                VALUES (?, ?, NOW())`,
                [
                    student.school_id,
                    student.course_id,
                    student.time_visit
                ],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.send("Unable to record visit: " + err.message);
                    }

                    res.redirect('/admin-dashboard');
                }
            );
        }
    );
});


//========== LOGOUT =========
libtrack.get('/logout', (req, res) => {
    console.log("ADMIN LOGGED OUT!");
    res.redirect('/login');
});



libtrack.listen(4500, () => {
    console.log("You are running on port 4500");
    console.log("http://localhost:4500/")
});