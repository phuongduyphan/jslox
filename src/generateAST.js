const path = require('path');
const fs = require('fs');

function defineAst (outputDir, baseName, types) {
  const _path = path.resolve(process.cwd(), outputDir);
  const writer = fs.createWriteStream(`${_path}/${baseName}.js`);
  
  writer.write(`class ${baseName} {\n}\n`);
  writer.write('\n');

  types.forEach(type => {
    const className = type.split(':')[0].trim();
    const fields = type.split(':')[1].trim();
    defineType(writer, baseName, className, fields);
    writer.write('\n');
  });

  writer.write('\n');
  writer.write(`module.exports = {\n`);
  writer.write(`  ${baseName},\n`);
  types.forEach(type => {
    const className = type.split(':')[0].trim();
    writer.write(`  ${className}${baseName},\n`);
  });
  writer.write('}\n');
}

function defineType (writer, baseName, className, fieldList) {
  writer.write(`class ${className}${baseName} extends ${baseName} {\n`);
  writer.write(`  constructor (${fieldList}) {\n`);
  writer.write('    super();\n');
  
  const fields = fieldList.split(', ');
  fields.forEach(field => {
    writer.write(`    this.${field} = ${field};\n`);
  });
  
  writer.write('  }\n\n');

  writer.write('  accept (visitor) {\n');
  writer.write(`    return visitor.visit${className}${baseName}(this);\n`);
  writer.write('  }\n');

  writer.write('}\n');
}

defineAst(process.argv[2], 'Expr', [
  'Assign: name, value',
  'Binary: left, operator, right',
  'Call: callee, paren, args',
  'Get: object, name',
  'Set: object, name, value',
  'This: keyword',
  'Grouping: expression',
  'Literal: value',
  'Logical: left, operator, right',
  'Unary: operator, right',
  'Variable: name'
]);

defineAst(process.argv[2], 'Stmt', [
  'Expression: expression',
  'Function: name, params, body',
  'If: condition, thenBranch, elseBranch',
  'Print: expression',
  'Var: name, initializer',
  'Block: statements',
  'While: condition, body',
  'Return: keyword, value',
  'Class: name, methods'
]);
