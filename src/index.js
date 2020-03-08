const fs = require('fs');
const Lox = require('./Lox');

const content = fs.readFileSync('./jlox.lox', 'utf-8');

Lox.run(content);