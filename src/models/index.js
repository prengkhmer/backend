// src/models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

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

Object.keys(db).forEach((name) => {
  if (db[name] && typeof db[name].associate === "function") {
    db[name].associate(db);
  }
});

module.exports = db;
