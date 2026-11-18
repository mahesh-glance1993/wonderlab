// usage: node app.js <target> <chunk> <comma list of unit consts>
const fs = require('fs');
const [target, chunk, list] = process.argv.slice(2);
let s = fs.readFileSync(target, 'utf8');
s = s.replace(/\nexport const units: USpec\[\] = \[[^\]]*\];\n?$/, '\n');
s += fs.readFileSync(chunk, 'utf8');
s += `\nexport const units: USpec[] = [${list.split(',').join(', ')}];\n`;
fs.writeFileSync(target, s);
console.log('ok', s.split('\n').length);
