const fs = require('fs');
const Lox = require('./Lox');

const content = fs.readFileSync('./jlox.txt', 'utf-8');

Lox.run(content);