const fs = require('fs');

const igvPath = require.resolve('../tmp/hic-straw.js')
let ping = fs.readFileSync(igvPath, 'utf-8');
const lines = ping.split(/\r?\n/);

const templatePath = require.resolve('./regeneratorRuntime.js')
let foo = fs.readFileSync(templatePath, 'utf-8');

const out = './dist/hic-straw.js';
let regenWritten = false;
var fd = fs.openSync(out, 'w');

for (let line of lines) {
    fs.writeSync(fd, line + '\n', null, 'utf-8')
    if (line.trim().length === 0 && !regenWritten) {
        fs.writeSync(fd, foo, null, 'utf-8');
        regenWritten = true;
    }
}

fs.closeSync(fd);
fs.unlinkSync(igvPath)
