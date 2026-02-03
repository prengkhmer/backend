// src/models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load all models except index.js
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const fullPath = path.join(__dirname, file);

    try {
      const modelFactory = require(fullPath);

      // MUST be a function: (sequelize, DataTypes) => Model
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

// Associations
Object.keys(db).forEach((name) => {
  if (db[name] && typeof db[name].associate === "function") {
    try {
      db[name].associate(db);
      console.log(`✅ Associations set for: ${name}`);
    } catch (err) {
      console.log(`❌ Association error in ${name}:`, err.message);
    }
  }
});

console.log(
  "✅ Sequelize models:",
  Object.keys(db).filter((k) => !["Sequelize", "sequelize"].includes(k))
);

module.exports = db;
