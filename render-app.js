'use strict';
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'output', 'app-data.json'), 'utf8'));
const template = fs.readFileSync(path.join(__dirname, 'app-template.html'), 'utf8');
const out = template.replace('__APP_DATA__', JSON.stringify(data));
fs.writeFileSync(path.join(__dirname, 'output', 'app.html'), out);
// Mirrored at the repo root as index.html so GitHub Pages serves it directly.
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('Wrote output/app.html and index.html', (out.length / 1024).toFixed(1) + 'kb');
