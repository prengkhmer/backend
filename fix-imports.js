const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/controllers/dashboardController.js',
  'src/controllers/paymentController.js',
  'src/controllers/PurchaseController.js',
  'src/controllers/reportController.js',
  'src/controllers/SaleController.js',
  'src/controllers/settingsController.js',
  'src/controllers/SetupController.js',
  'src/controllers/SupplierController.js',
  'src/controllers/UserController.js',
  'src/controllers/SaleItemController.js',
  'src/controllers/PurchaseItemController.js',
  'src/controllers/RoleController.js',
  'src/controllers/productController.js',
  'src/controllers/importController.js',
  'src/controllers/customerController.js',
  'src/controllers/categoryController.js',
  'src/controllers/brandController.js',
  'src/routes/stockRoutes.js'
];

console.log('🔄 Updating database imports...');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace config/db imports with models imports
    const oldPattern = /require\(['"]\.\.\/config\/db['"]\)/g;
    const newImport = "require('../models')";
    
    if (content.match(oldPattern)) {
      content = content.replace(oldPattern, newImport);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no config/db import found)`);
    }
  } else {
    console.log(`❌ Not found: ${filePath}`);
  }
});

console.log('🎉 Import updates completed!');