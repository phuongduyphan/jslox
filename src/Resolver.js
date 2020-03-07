const FunctionType = require('./functionType');

class Resolver {
  constructor (interpreter) {
    this.interpreter = interpreter;
    this.scopes = [];
    this.Lox = require('./Lox');
    this.currentFunction = FunctionType.NONE;
  }

  visitBlockStmt (stmt) {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
  }

  visitVarStmt (stmt) {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitFunctionStmt (stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitExpressionStmt (stmt) {
    this.resolveExpr(stmt.expression);
  }

  visitIfStmt (stmt) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch) this.resolveStmt(stmt.elseBranch);
  }

  visitPrintStmt (stmt) {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt (stmt) {
    if (this.currentFunction === FunctionType.NONE) {
      this.Lox.tokenError(stmt.keyword, 'Cannot return from top-level code.');
    }

    if (stmt.value) {
      this.resolveExpr(stmt.value);
    }
  }

  visitWhileStmt (stmt) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
  }

  resolveFunction (func, type) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    func.params.forEach(param => {
      this.declare(param);
      this.define(param);
    });
    this.resolveStmts(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  resolveStmts (statements) {
    statements.forEach(statement => {
      this.resolveStmt(statement);
    });
  }

  resolveStmt (stmt) {
    stmt.accept(this);
  }

  beginScope () {
    this.scopes.push(new Map());
  }

  endScope () {
    this.scopes.pop();
  }

  resolveExpr (expr) {
    expr.accept(this);
  }

  declare (name) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      this.Lox.tokenError(name, 'Variable with this name already declared in this scope.');
    }

    scope.set(name.lexeme, false);
  }

  define (name) {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lexeme, true);
  }

  visitVariableExpr (expr) {
    if (this.scopes.length !== 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
      this.Lox.tokenError(expr.name, 'Cannot read  local variable in its own initializer.');
    }

    this.resolveLocal(expr, expr.name);
  }

  visitAssignExpr (expr) {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  resolveLocal (expr, name) {
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  visitBinaryExpr (expr) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr (expr) {
    this.resolveExpr(expr.callee);

    expr.args.forEach(arg => {
      this.resolveExpr(arg);
    });
  }

  visitGroupingExpr (expr) {
    this.resolveExpr(expr.expression);
  }

  visitLiteralExpr () {
  }

  visitLogicalExpr (expr) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitUnaryExpr (expr) {
    this.resolveExpr(expr.right);
  }
}

module.exports = Resolver;