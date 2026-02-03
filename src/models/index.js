// src/models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

// Initialize Sequelize based on environment
let sequelize;
if (process.env.DATABASE_URL) {
  // Production: Use Railway DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('✅ Using Railway DATABASE_URL connection');
} else {
  // Local development
  sequelize = new Sequelize('ecommerce', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('✅ Using local database connection');
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const fullPath = path.join(__dirname, file);

    try {
      const modelFactory = require(fullPath);

      if (typeof modelFactory !== "function") {
        console.log(`⚠️ Skip (not a model factory): ${file}`);
        return;
      }

      const model = modelFactory(sequelize, Sequelize.DataTypes);

      if (!model || !model.name) {
        console.log(`❌ Invalid model export in: ${file}`);
        return;
      }

      db[model.name] = model;
      console.log(`✅ Loaded model: ${model.name} from ${file}`);
    } catch (err) {
      console.log(`❌ Failed to load model file ${file}:`, err.message);
    }
  });

// Set up associations
Object.keys(db).forEach((name) => {
  if (db[name] && typeof db[name].associate === "function") {
    try {
      db[name].associate(db);
      console.log(`✅ ${name} associations set up`);
    } catch (error) {
      console.log(`❌ Failed to set up associations for ${name}:`, error.message);
    }
  }
});

console.log('✅ Models initialized:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

module.exports = db;
