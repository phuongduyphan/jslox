const Environment = require('./Environment');
const { Return } = require('./Error');

class LoxFunction {
  constructor (declaration, closure) {
    this.declaration = declaration;
    this.closure = closure;
  }

  arity () {
    return this.declaration.params.length;
  }

  call (interpreter, args) {
    const environment = new Environment(this.closure);
    this.declaration.params.forEach((param, i) => {
      environment.define(param.lexeme, args[i])
    });

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof Return) {
        return err.value;
      }
      throw err;
    }
    return null;
  }

  toString () {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}

module.exports = LoxFunction;
