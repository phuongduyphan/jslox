class Stmt {
}

class ExpressionStmt extends Stmt {
  constructor (expression) {
    super();
    this.expression = expression;
  }

  accept (visitor) {
    return visitor.visitExpressionStmt(this);
  }
}

class FunctionStmt extends Stmt {
  constructor (name, params, body) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept (visitor) {
    return visitor.visitFunctionStmt(this);
  }
}

class IfStmt extends Stmt {
  constructor (condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept (visitor) {
    return visitor.visitIfStmt(this);
  }
}

class PrintStmt extends Stmt {
  constructor (expression) {
    super();
    this.expression = expression;
  }

  accept (visitor) {
    return visitor.visitPrintStmt(this);
  }
}

class VarStmt extends Stmt {
  constructor (name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept (visitor) {
    return visitor.visitVarStmt(this);
  }
}

class BlockStmt extends Stmt {
  constructor (statements) {
    super();
    this.statements = statements;
  }

  accept (visitor) {
    return visitor.visitBlockStmt(this);
  }
}

class WhileStmt extends Stmt {
  constructor (condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept (visitor) {
    return visitor.visitWhileStmt(this);
  }
}

class ReturnStmt extends Stmt {
  constructor (keyword, value) {
    super();
    this.keyword = keyword;
    this.value = value;
  }

  accept (visitor) {
    return visitor.visitReturnStmt(this);
  }
}

class ClassStmt extends Stmt {
  constructor (name, methods) {
    super();
    this.name = name;
    this.methods = methods;
  }

  accept (visitor) {
    return visitor.visitClassStmt(this);
  }
}


module.exports = {
  Stmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  VarStmt,
  BlockStmt,
  WhileStmt,
  ReturnStmt,
  ClassStmt,
}
