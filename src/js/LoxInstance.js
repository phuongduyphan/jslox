const { RuntimeError } = require('./Error');

class LoxInstance {
  constructor (klass) {
    this.klass = klass;
    this.fields = new Map();
  }

  get (name) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) return method.bind(this);

    throw new RuntimeError(name, `Undefined property ${name.lexeme}.`);
  }

  set (name, value) {
    this.fields.set(name.lexeme, value);
  }

  toString () {
    return `${this.klass.name} instance`;
  }
}

module.exports = LoxInstance;
