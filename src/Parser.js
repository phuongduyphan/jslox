const {
  BANG_EQUAL,
  EQUAL_EQUAL,
  EOF,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  MINUS,
  PLUS,
  SLASH,
  STAR,
  BANG,
  FALSE,
  TRUE,
  NIL,
  NUMBER,
  STRING,
  LEFT_PAREN,
  RIGHT_PAREN,
  SEMICOLON,
  CLASS,
  FUN,
  VAR,
  FOR,
  IF,
  WHILE,
  PRINT,
  RETURN,
  IDENTIFIER,
  EQUAL,
  LEFT_BRACE,
  RIGHT_BRACE,
  ELSE,
  OR,
  AND,
  COMMA,
  DOT,
  THIS,
  SUPER
} = require('./tokenType');
const {
  BinaryExpr, UnaryExpr, LiteralExpr, GroupingExpr, VariableExpr,
  AssignExpr, LogicalExpr, CallExpr, GetExpr, SetExpr, ThisExpr, SuperExpr
} = require('./Expr');
const { PrintStmt, ExpressionStmt, VarStmt, BlockStmt, IfStmt, WhileStmt, FunctionStmt, ReturnStmt, ClassStmt } = require('./Stmt');
const { ParseError } = require('./Error');

class Parser {
  constructor (tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.Lox = require('./Lox');
  }

  parse () {
    const statements = [];
    while (!this.isAtEnd) {
      statements.push(this.declaration());
    }

    return statements;
  }

  declaration () {
    try {
      if (this.match(CLASS)) {
        return this.classDeclaration();
      }
      if (this.match(FUN)) {
        return this.function('function');
      }
      if (this.match(VAR)) {
        return this.varDeclaration();
      }
      return this.statement();
    } catch (err) {
      this.synchronize();
    }
  }

  classDeclaration () {
    const name = this.consume(IDENTIFIER, 'Expect class name.');

    let superclass = null;
    if (this.match(LESS)) {
      this.consume(IDENTIFIER, 'Expect superclass name.');
      superclass = new VariableExpr(this.previous());
    }

    this.consume(LEFT_BRACE, `Expect '{' before class body.`);

    const methods = [];
    while (!this.check(RIGHT_BRACE) && !this.isAtEnd) {
      methods.push(this.function('method'));
    }

    this.consume(RIGHT_BRACE, `Expect '}' after class body.`);
    return new ClassStmt(name, methods, superclass);
  }

  function (kind) {
    const name = this.consume(IDENTIFIER, `Expect ${kind} name`);
    this.consume(LEFT_PAREN, `Expect '(' after ${kind} name`);
    const parameters = [];
    if (!this.check(RIGHT_PAREN)) {
      do {
        if (parameters.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 parameters.');
        }

        parameters.push(this.consume(IDENTIFIER, 'Expect parameter name.'));
      } while (this.match(COMMA))
    }
    this.consume(RIGHT_PAREN, `Expect ')' after parameters.`);

    this.consume(LEFT_BRACE, `Expect { before ${kind} body.`);
    const body = this.block();
    return new FunctionStmt(name, parameters, body);
  }

  varDeclaration () {
    const name = this.consume(IDENTIFIER, 'Expect variable name.');

    let initializer = null;
    if (this.match(EQUAL)) {
      initializer = this.expression();
    }

    this.consume(SEMICOLON, `Expect ';' after variable declaration.`);
    return new VarStmt(name, initializer);
  }

  statement () {
    if (this.match(FOR)) return this.forStatement();
    if (this.match(IF)) return this.ifStatement();
    if (this.match(PRINT)) return this.printStatement();
    if (this.match(RETURN)) return this.returnStatement();
    if (this.match(WHILE)) return this.whileStatement();
    if (this.match(LEFT_BRACE)) return new BlockStmt(this.block());

    return this.expressionStatement();
  }

  forStatement () {
    this.consume(LEFT_PAREN, `Expect '(' after for.`);

    let initializer;
    if (this.match(SEMICOLON)) {
      initializer = null;
    } else if (this.match(VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(SEMICOLON, `Expect ';' after loop condition.`);

    let increment = null;
    if (!this.check(RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(RIGHT_PAREN, `Expect ')' after for clauses.`);

    let body = this.statement();

    if (increment) {
      body = new BlockStmt([body, new ExpressionStmt(increment)]);
    }

    if (!condition) {
      condition = new LiteralExpr(true);
    }
    body = new WhileStmt(condition, body);

    if (initializer) {
      body = new BlockStmt([initializer, body]);
    }

    return body;
  }

  ifStatement () {
    this.consume(LEFT_PAREN, `Expect '(' after 'if'.`);
    const condition = this.expression();
    this.consume(RIGHT_PAREN, `Expect ')' after if condition.`);

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(ELSE)) {
      elseBranch = this.statement();
    }

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  printStatement () {
    const value = this.expression();
    this.consume(SEMICOLON, `Expect ';' after value.`);
    return new PrintStmt(value);
  }

  returnStatement () {
    const keyword = this.previous();
    let value = null;
    if (!this.check(SEMICOLON)) {
      value = this.expression();
    }

    this.consume(SEMICOLON, `Expect ';' after return value.`);
    return new ReturnStmt(keyword, value);
  }

  whileStatement () {
    this.consume(LEFT_PAREN, `Expect '(' after while.`);
    const condition = this.expression();
    this.consume(RIGHT_PAREN, `Expect ')' after condition.`);
    const body = this.statement();

    return new WhileStmt(condition, body);
  }

  expressionStatement () {
    const expr = this.expression();
    this.consume(SEMICOLON, `Expect ';' after expression.`);
    return new ExpressionStmt(expr);
  }

  block () {
    const statements = [];

    while (!this.check(RIGHT_BRACE) && !this.isAtEnd) {
      statements.push(this.declaration());
    }

    this.consume(RIGHT_BRACE, `Expect '}' after block.`);
    return statements;
  }

  expression () {
    return this.assignment();
  }

  assignment () {
    const expr = this.or();

    if (this.match(EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof VariableExpr) {
        const name = expr.name;
        return new AssignExpr(name, value);
      } else if (expr instanceof GetExpr) {
        return new SetExpr(expr.object, expr.name, value);
      }

      this.error(equals, 'Invalid assignment target.');
    }
    return expr;
  }

  or () {
    let expr = this.and();

    while (this.match(OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  and () {
    let expr = this.equality();

    while (this.match(AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  equality () {
    let expr = this.comparison();

    while (this.match(BANG_EQUAL, EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  comparison () {
    let expr = this.addition();

    while (this.match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  addition () {
    let expr = this.multiplication();

    while (this.match(MINUS, PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  multiplication () {
    let expr = this.unary();

    while (this.match(SLASH, STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  unary () {
    if (this.match(BANG, MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }
    return this.call();
  }

  call () {
    let expr = this.primary();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.match(LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(DOT)) {
        const name = this.consume(IDENTIFIER, `Expect property name after '.'.`);
        expr = new GetExpr(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  finishCall (callee) {
    const args = [];
    if (!this.check(RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 arguments.');
        }
        args.push(this.expression());
      } while (this.match(COMMA));
    }

    const paren = this.consume(RIGHT_PAREN, `Expect ')' after arguments.`);
    return new CallExpr(callee, paren, args);
  }

  primary () {
    if (this.match(FALSE)) {
      return new LiteralExpr(false);
    }
    if (this.match(TRUE)) {
      return new LiteralExpr(true);
    }
    if (this.match(NIL)) {
      return new LiteralExpr(null);
    }

    if (this.match(NUMBER, STRING)) {
      return new LiteralExpr(this.previous().literal);
    }

    if (this.match(LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(RIGHT_PAREN, `Expect ')' after expression.`);
      return new GroupingExpr(expr);
    }

    if (this.match(SUPER)) {
      const keyword = this.previous();
      this.consume(DOT, `Expect '.' after 'super'.`);
      const method = this.consume(IDENTIFIER, 'Expect superclass method name.');
      return new SuperExpr(keyword, method);
    }

    if (this.match(THIS)) {
      return new ThisExpr(this.previous());
    }

    if (this.match(IDENTIFIER)) {
      return new VariableExpr(this.previous());
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  match (...tokenTypes) {
    const check = tokenTypes.some(type => this.check(type));
    if (check) {
      this.advance();
      return true;
    }
    return false;
  }

  check (tokenType) {
    return this.isAtEnd ? false : this.peek().type === tokenType;
  }

  consume (tokenType, message) {
    if (this.check(tokenType)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  error (token, message) {
    this.Lox.tokenError(token, message);
    return new ParseError();
  }

  synchronize () {
    this.advance();

    while (!this.isAtEnd) {
      if (this.previous().type === SEMICOLON) return;

      switch (this.peek().type) {
        case CLASS:
        case FUN:
        case VAR:
        case FOR:
        case IF:
        case WHILE:
        case PRINT:
        case RETURN:
          return;

        default:
          break;
      }

      this.advance();
    }
  }

  advance () {
    if (!this.isAtEnd) {
      this.current += 1;
    }
    return this.previous();
  }

  peek () {
    return this.tokens[this.current];
  }

  previous () {
    return this.tokens[this.current - 1];
  }

  get isAtEnd () {
    return this.peek().type === EOF;
  }
}

module.exports = Parser;
