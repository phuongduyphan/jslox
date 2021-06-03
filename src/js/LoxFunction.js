const Environment = require('./Environment');
const { Return } = require('./Error');

class LoxFunction {
  constructor (declaration, closure, isInitializer = false) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
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
        if (this.isInitializer) return this.closure.getAt(0, 'this');
        return err.value;
      }
      throw err;
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this');
    return null;
  }

  bind (instance) {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  toString () {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}

module.exports = LoxFunction;
