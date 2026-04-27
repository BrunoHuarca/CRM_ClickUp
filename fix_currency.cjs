const fs = require('fs');
const cp = require('child_process');

function replaceInFiles(files, regex, replacement) {
  files.forEach(f => {
    if(fs.existsSync(f)){
      let c = fs.readFileSync(f, 'utf8');
      c = c.replace(regex, replacement);
      fs.writeFileSync(f, c);
    }
  });
}

const files = cp.execSync('dir /s /b src\\components\\*.tsx').toString().split('\r\n').filter(Boolean);

replaceInFiles(files, /Intl\.NumberFormat\('es-PE'/g, "Intl.NumberFormat('en-US'");
replaceInFiles(files, /currency: 'PEN'/g, "currency: 'USD'");
