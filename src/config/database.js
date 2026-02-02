// // config/database.js
// const { Sequelize } = require('sequelize');
// const path = require('path');
// const fs = require('fs');

// // Initialize Sequelize
// const sequelize = new Sequelize('ecommerce', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
//   logging: false, // Set to console.log to see SQL queries
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// });

// // Object to hold all models
// const db = {};

// // Import all model files
// const modelsPath = path.join(__dirname, '../models');
// const modelFiles = fs.readdirSync(modelsPath)
//   .filter(file => file.endsWith('.js') && file !== 'index.js');

// // Load each model
// modelFiles.forEach(file => {
//   const modelPath = path.join(modelsPath, file);
//   const model = require(modelPath)(sequelize);
//   if (model && model.name) {
//     db[model.name] = model;
//   }
// });

// // Set up associations
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// // Add Sequelize instance and constructor to db object
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// console.log('✅ Sequelize initialized with models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

// module.exports = db;

require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || "ecommerce",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
      },
    );

module.exports = sequelize;
