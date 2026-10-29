const mysql = require('mysql');
const conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'project123',
    password: 'MySQL@12345',
    database: 'libtrack_26'
});
conn.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Database connected');
});

module.exports = conn;