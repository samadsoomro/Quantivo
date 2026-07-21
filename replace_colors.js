const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Tailwind classes
  const classes = ['text', 'bg', 'border', 'from', 'to', 'ring', 'fill', 'stroke', 'shadow', 'divide', 'outline', 'decoration', 'accent', 'caret'];
  classes.forEach(c => {
    content = content.replace(new RegExp(c + '-\\\\[#c0c1ff\\\\]', 'g'), c + '-primary');
    content = content.replace(new RegExp(c + '-\\\\[#7c7fff\\\\]', 'g'), c + '-accent');
    content = content.replace(new RegExp(c + '-\\\\[#e1dfff\\\\]', 'g'), c + '-primary-hover');
  });

  // Inline styles and attributes
  content = content.replace(/'#c0c1ff'/g, "'var(--color-primary)'");
  content = content.replace(/"#c0c1ff"/g, '"var(--color-primary)"');
  content = content.replace(/'#7c7fff'/g, "'var(--color-accent)'");
  content = content.replace(/"#7c7fff"/g, '"var(--color-accent)"');
  content = content.replace(/'#e1dfff'/g, "'var(--color-primary-hover)'");
  content = content.replace(/"#e1dfff"/g, '"var(--color-primary-hover)"');

  // Also replace some rgb references
  content = content.replace(/192,\s*193,\s*255/g, "var(--color-primary-rgb)");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

walkDir(path.join(process.cwd(), 'app'), replaceInFile);
walkDir(path.join(process.cwd(), 'components'), replaceInFile);
console.log('Done.');
