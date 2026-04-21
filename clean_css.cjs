const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

const keepThemes = ['manga', 'curse', 'shinobi', 'titan', 'saiyan', 'cyberpunk'];
const allThemes = [
  'manga', 'curse', 'shinobi', 'titan', 'saiyan',
  'hollow', 'shinigami', 'alchemy', 'hero', 'pirate',
  'hunter', 'ghoul', 'slayer', 'eva', 'jojo',
  'geass', 'sorcerer', 'cyberpunk', 'mecha', 'clover'
];

allThemes.forEach(theme => {
  if (!keepThemes.includes(theme)) {
    const rx = new RegExp(`\\/\\*.*?\\*\\/[\\s\\S]*?\\[data-theme="${theme}"\\][\\s\\S]*?\\n\\}`, 'g');
    css = css.replace(rx, '');
  }
});

// Remove multiple consecutive newlines
css = css.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(cssPath, css);
console.log('Cleaned CSS!');
