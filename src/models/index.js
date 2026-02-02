// This file is not used - models are loaded directly in config/db.js
// All model imports and associations are handled in src/config/db.js

// module.exports = {};
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
    try {
      const modelFactory = require(path.join(__dirname, file));

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
    } catch (e) {
      console.log(`❌ Failed to load model file ${file}:`, e.message);
    }
  });

// Run associations
Object.keys(db).forEach((name) => {
  if (db[name] && typeof db[name].associate === "function") {
    try {
      db[name].associate(db);
      console.log(`✅ Associations set for: ${name}`);
    } catch (e) {
      console.log(`❌ Association error in ${name}:`, e.message);
    }
  }
});

console.log(
  "✅ Sequelize models:",
  Object.keys(db).filter((k) => !["Sequelize", "sequelize"].includes(k)),
);

module.exports = db;
