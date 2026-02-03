// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Supplier = sequelize.define(
//     "Supplier",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(20),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(100),
//         allowNull: true,
//       },
//       phone_first: {
//         type: DataTypes.STRING(20),
//         allowNull: true,
//       },
//       phone_second: {
//         type: DataTypes.STRING(20),
//         allowNull: true,
//       },
//       address: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//     },
//     {
//       tableName: "supplier",
//       timestamps: true,
//       createdAt: "createdAt",
//       updatedAt: "updatedAt",
//     },
//   );

//   // Define associations
//   Supplier.associate = function (models) {
//     try {
//       if (models.Purchase) {
//         Supplier.hasMany(models.Purchase, { foreignKey: "supplier_id" });
//       }
//       if (models.Product) {
//         Supplier.hasMany(models.Product, {
//           foreignKey: "supplier_id",
//           as: "Products",
//         });
//       }
//     } catch (error) {
//       // console.error('Error in Supplier.associate:', error);
//     }
//   };

//   return Supplier;
// };

// src/models/Supplier.js
module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: true },
      phone_first: { type: DataTypes.STRING(20), allowNull: true },
      phone_second: { type: DataTypes.STRING(20), allowNull: true },
      address: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: "supplier",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  Supplier.associate = (models) => {
    if (models.Purchase) {
      Supplier.hasMany(models.Purchase, { foreignKey: "supplier_id" });
    }
    if (models.Product) {
      Supplier.hasMany(models.Product, {
        foreignKey: "supplier_id",
        as: "Products",
      });
    }
  };

  return Supplier;
};
