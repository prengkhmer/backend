// const mysql = require('mysql2/promise');

// // Create MySQL connection pool
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'ecommerce',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Test connection
// pool.getConnection()
//   .then(connection => {
//     console.log('✅ Raw MySQL connection established successfully');
//     connection.release();
//   })
//   .catch(err => {
//     console.error('❌ Raw MySQL connection failed:', err.message);
//   });

// module.exports = pool;