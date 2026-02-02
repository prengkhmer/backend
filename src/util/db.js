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
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = { sequelize };
