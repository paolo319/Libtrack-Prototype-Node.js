const mysql = require('mysql');
const conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'libtrack_db'
});
conn.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Database connected');
});

module.exports = conn;