const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');

console.log('🔄 Fixing model exports...');

// Get all model files
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it needs fixing
  const oldPattern = /module\.exports\s*=\s*\(sequelize\)\s*=>/;
  const newPattern = 'module.exports = (sequelize, DataTypes) =>';
  
  if (content.match(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
  } else if (content.includes('module.exports = (sequelize, DataTypes)')) {
    console.log(`⏭️  Already fixed: ${file}`);
  } else {
    console.log(`⚠️  Manual check needed: ${file}`);
  }
});

console.log('🎉 Model export fixes completed!');