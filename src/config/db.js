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

require("dotenv").config();
const { Sequelize } = require("sequelize");

// Railway: DATABASE_URL should be like mysql://user:pass@host:port/db
const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL && DATABASE_URL.startsWith("mysql")) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // local fallback
  sequelize = new Sequelize(
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
}

module.exports = sequelize;
