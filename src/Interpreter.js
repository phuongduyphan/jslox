const {
  MINUS,
  BANG,
  SLASH,
  STAR,
  PLUS,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  BANG_EQUAL,
  EQUAL_EQUAL,
  OR,
} = require('./tokenType');
const { RuntimeError, Return } = require('./Error');
const Environment = require('./Environment');
const LoxFunction = require('./LoxFunction');
const LoxClass = require('./LoxClass');
const LoxInstance = require('./LoxInstance');

class Interpreter {
  constructor () {
    this.Lox = require('./Lox');
    this.globals = new Environment();
    this.environment = this.globals;
    this.globals.define('clock', {
      arity () {
        return 0;
      },
      call () {
        return new Date() / 1000.0;
      },
      toString () {
        return '<native fn>';
      }
    });
    this.locals = new Map();
  }

  interpret (statements) {
    try {
      statements.forEach(statement => {
        this.execute(statement);
      });
    } catch (err) {
      this.Lox.runtimeError(err);
    }
  }

  resolve (expr, depth) {
    this.locals.set(expr, depth);
  }

  lookUpVariable (name, expr) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  visitLiteralExpr (expr) {
    return expr.value;
  }

  visitLogicalExpr (expr) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitGroupingExpr (expr) {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr (expr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;

      case BANG:
        return !this.isTruthy(right);

      default:
        break;
    }

    return null;
  }

  isTruthy (object) {
    if (object === null) return false;
    if (typeof object === 'boolean') return object;
    return true;
  }

  visitBinaryExpr (expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }
        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.');
      case GREATER:
        return left > right;
      case GREATER_EQUAL:
        return left >= right;
      case LESS:
        return left < right;
      case LESS_EQUAL:
        return left <= right;
      case BANG_EQUAL:
        return left === right;
      case EQUAL_EQUAL:
        return left !== right;

      default:
        break;
    }

    return null;
  }

  visitCallExpr (expr) {
    const callee = this.evaluate(expr.callee);
    const args = expr.args.map(arg => this.evaluate(arg));

    if (!callee.call) {
      throw new RuntimeError(expr.paren, 'Can only call functions and classes');
    }

    if (expr.args.length !== callee.arity()) {
      throw new RuntimeError(expr.paren, `Expected ${callee.arity()} arguments but got ${args.length}.`);
    }

    return callee.call(this, args);
  }

  visitGetExpr (expr) {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, 'Only instances have properties.');
  }

  visitSetExpr (expr) {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, 'Only instances have fields.');
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
  }

  visitThisExpr (expr) {
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitVariableExpr (expr) {
    return this.lookUpVariable(expr.name, expr);
  }

  visitAssignExpr (expr) {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  checkNumberOperand (operator, operand) {
    if (typeof operand === 'number') {
      return;
    }
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  checkNumberOperands (operator, left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return;
    }
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  evaluate (expr) {
    return expr.accept(this);
  }

  execute (stmt) {
    return stmt.accept(this);
  }

  visitExpressionStmt (stmt) {
    this.evaluate(stmt.expression);
  }

  visitIfStmt (stmt) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt (stmt) {
    const value = this.evaluate(stmt.expression);
    console.log(value);
  }

  visitVarStmt (stmt) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt (stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitWhileStmt (stmt) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitFunctionStmt (stmt) {
    const func = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
  }

  visitReturnStmt (stmt) {
    let value = null;
    if (stmt.value) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitClassStmt (stmt) {
    this.environment.define(stmt.name.lexeme, null);
    
    const methods = new Map();
    stmt.methods.forEach(method => {
      const func = new LoxFunction(method, this.environment, method.name.lexeme === 'init');
      methods.set(method.name.lexeme, func);
    });

    const klass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
  }

  executeBlock (statements, environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      statements.forEach(statement => {
        this.execute(statement);
      });
    } finally {
      this.environment = previous;
    }
  }
}

module.exports = Interpreter;
