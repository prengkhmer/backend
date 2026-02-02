// This file is not used - models are loaded directly in config/db.js
// All model imports and associations are handled in src/config/db.js

// module.exports = {};
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

// Load models (គ្រប់ model file ត្រូវ export function (sequelize, DataTypes)=>Model)
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ✅ Example (ប្ដូរតាមឈ្មោះ model files របស់ប្អូន)
db.Product = require("./Product")(sequelize, Sequelize.DataTypes);
db.Brand = require("./Brand")(sequelize, Sequelize.DataTypes);
db.Category = require("./Category")(sequelize, Sequelize.DataTypes);
db.Supplier = require("./Supplier")(sequelize, Sequelize.DataTypes);
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Role = require("./Role")(sequelize, Sequelize.DataTypes);
db.Permission = require("./Permission")(sequelize, Sequelize.DataTypes);
db.RolePermission = require("./RolePermission")(sequelize, Sequelize.DataTypes);
db.Customer = require("./Customer")(sequelize, Sequelize.DataTypes);
db.Purchase = require("./Purchase")(sequelize, Sequelize.DataTypes);
db.PurchaseItem = require("./PurchaseItem")(sequelize, Sequelize.DataTypes);
db.Sale = require("./Sale")(sequelize, Sequelize.DataTypes);
db.SaleItem = require("./SaleItem")(sequelize, Sequelize.DataTypes);
db.Payment = require("./Payment")(sequelize, Sequelize.DataTypes);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.Setting = require("./Setting")(sequelize, Sequelize.DataTypes);
db.Staff = require("./Staff")(sequelize, Sequelize.DataTypes);

// ✅ Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
