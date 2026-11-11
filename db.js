const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

let caCert;
// Ưu tiên đọc từ biến môi trường, xử lý lại dấu xuống dòng bị lỗi khi đọc từ chuỗi
if (process.env.DB_SSL_CERT) {
    caCert = process.env.DB_SSL_CERT.replace(/\\n/g, '\n');
} else {
    // Nếu không có biến môi trường, đọc trực tiếp từ file vật lý
    try {
        caCert = fs.readFileSync(path.join(__dirname, 'ca.pem')).toString();
    } catch (err) {
        console.log("⚠️ Không tìm thấy biến môi trường DB_SSL_CERT hoặc file ca.pem");
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, 
    ssl: caCert ? { 
        ca: caCert,
        rejectUnauthorized: true // Đảm bảo xác thực đúng chứng chỉ Aiven
    } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log("⚡ Kết nối Database Cloud thành công!");
        conn.release(); 
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối Database:", err.message);
    });

module.exports = pool;