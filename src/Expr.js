class Expr {
}

class AssignExpr extends Expr {
  constructor (name, value) {
    super();
    this.name = name;
    this.value = value;
  }

  accept (visitor) {
    return visitor.visitAssignExpr(this);
  }
}

class BinaryExpr extends Expr {
  constructor (left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept (visitor) {
    return visitor.visitBinaryExpr(this);
  }
}

class CallExpr extends Expr {
  constructor (callee, paren, args) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept (visitor) {
    return visitor.visitCallExpr(this);
  }
}

class GroupingExpr extends Expr {
  constructor (expression) {
    super();
    this.expression = expression;
  }

  accept (visitor) {
    return visitor.visitGroupingExpr(this);
  }
}

class LiteralExpr extends Expr {
  constructor (value) {
    super();
    this.value = value;
  }

  accept (visitor) {
    return visitor.visitLiteralExpr(this);
  }
}

class LogicalExpr extends Expr {
  constructor (left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept (visitor) {
    return visitor.visitLogicalExpr(this);
  }
}

class UnaryExpr extends Expr {
  constructor (operator, right) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept (visitor) {
    return visitor.visitUnaryExpr(this);
  }
}

class VariableExpr extends Expr {
  constructor (name) {
    super();
    this.name = name;
  }

  accept (visitor) {
    return visitor.visitVariableExpr(this);
  }
}


module.exports = {
  Expr,
  AssignExpr,
  BinaryExpr,
  CallExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
  VariableExpr,
}
