const fs = require('fs');
const path = require('path');

const directory = 'e:/Nursetra_app/Nursetra/src';

const replacements = {
  '../../theme': '../../Themes',
  '../../components': '../../Components',
  '../../navigation': '../../Navigator',
  '../../screens': '../../Screen',
  '../../constants': '../../Constants',
  '../theme': '../Themes',
  '../components': '../Components',
  '../navigation': '../Navigator',
  '../screens': '../Screen',
  '../constants': '../Constants',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldStr, newStr] of Object.entries(replacements)) {
        if (content.includes(oldStr)) {
          content = content.split(oldStr).join(newStr);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
