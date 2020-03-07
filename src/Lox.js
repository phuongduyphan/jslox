const Scanner = require('./Scanner');
const Parser = require('./Parser');
const Resolver = require('./Resolver');
const Interpreter = require('./Interpreter');
// const ASTPrinter = require('./ASTPrinter');
const { EOF } = require('./tokenType');

class Lox {
  static run (source) {
    if (Lox.hadError) {
      throw new Error('Error occurs.');
    }
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (Lox.hadError) return;
    
    const resolver = new Resolver(Lox.interpreter);

    if (Lox.hadError) return;

    resolver.resolveStmts(statements);
    Lox.interpreter.interpret(statements);
  }

  static error (line, message) {
    Lox.report(line, '', message);
  }

  static tokenError (token, message) {
    if (token.type === EOF) {
      Lox.report(token.line, ' at end', message);
    } else {
      Lox.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  static runtimeError (error) {
    console.log(`${error.message}\n[line ${error.token.line}]`);
    Lox.hadRuntimeError = true;
  }

  static report (line, where, message) {
    Lox.hadError = true;
    console.log(`[line ${line}] Error${where}: ${message}`);
  }
}

module.exports = Lox;

Lox.hadError = false;
Lox.hadRuntimeError = false;
Lox.interpreter = new Interpreter();

