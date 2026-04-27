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

const files = cp.execSync('dir /s /b src\\*.tsx src\\*.ts').toString().split('\r\n').filter(Boolean);

replaceInFiles(files, /'cerrado'/g, "'Publicado'");
replaceInFiles(files, /"cerrado"/g, "'Publicado'");
replaceInFiles(files, /propietarioNombreNombre/g, 'propietarioNombre');
replaceInFiles(['src/components/Dashboard.tsx'], /captacion:/g, 'Captación:');
replaceInFiles(['src/components/Dashboard.tsx'], /legal:/g, 'Legal:');
replaceInFiles(['src/components/Dashboard.tsx'], /marketing:/g, 'Marketing:');
replaceInFiles(['src/components/Dashboard.tsx'], /venta:/g, 'Gerencia:'); // Assuming venta maps to Gerencia, or I can just fix it manually.
