class ASTPrinter {
  print (expr) {
    return expr.accept(this);
  }

  visitBinaryExpr (expr) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr (expr) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr (expr) {
    if (!expr.value) return 'nil';
    return expr.value.toString();
  }

  visitUnaryExpr (expr) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize (name, ...exprs) {
    return `(${name} ${exprs.map(expr => ` ${expr.accept(this)}`).join('')})`;
  }
}

module.exports = ASTPrinter;

// const { BinaryExpr, UnaryExpr, GroupingExpr, LiteralExpr } = require('./Expr');
// const Token = require('./Token');
// const tokenType = require('./tokenType');

// const expr = new BinaryExpr(
//   new UnaryExpr(new Token(tokenType.MINUS, "-", null, 1), new LiteralExpr(123)),
//   new Token(tokenType.STAR, "*", null, 1),
//   new GroupingExpr(new LiteralExpr(45.67))
// );

// console.log(new ASTPrinter().print(expr));