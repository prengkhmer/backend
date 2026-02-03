// // db.js - Updated to use Sequelize with models
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
//   try {
//     const modelPath = path.join(modelsPath, file);
//     const model = require(modelPath)(sequelize, Sequelize.DataTypes);
//     if (model && model.name) {
//       db[model.name] = model;
//       console.log(`✅ ${model.name} model loaded`);
//     }
//   } catch (error) {
//     console.log(`❌ Failed to load model from ${file}:`, error.message);
//   }
// });

// // Set up associations after all models are loaded
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     try {
//       db[modelName].associate(db);
//       console.log(`✅ ${modelName} associations set up`);
//     } catch (error) {
//       console.log(`❌ Failed to set up associations for ${modelName}:`, error.message);
//     }
//   }
// });

// // Add Sequelize instance and constructor to db object
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// console.log('✅ Sequelize initialized with models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

// module.exports = db;



////

// src/config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    ssl: false, // INTERNAL connection → no SSL
  },
});

module.exports = sequelize;
