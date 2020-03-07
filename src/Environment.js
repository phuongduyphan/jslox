const { RuntimeError } = require('./Error');

class Environment {
  constructor (enclosing = null) {
    this.values = new Map();
    this.enclosing = enclosing;
  }

  define (name, value) {
    this.values.set(name, value);
  }

  get (token) {
    if (this.values.has(token.lexeme)) {
      return this.values.get(token.lexeme);
    }

    if (this.enclosing) {
      return this.enclosing.get(token);
    }

    throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
  }

  assign (token, value) {
    if (this.values.has(token.lexeme)) {
      this.values.set(token.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(token, value);
      return;
    }

    throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
  }

  getAt (distance, name) {
    return this.ancestor(distance).values.get(name);
  }

  assignAt (distance, name, value) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  ancestor (distance) {
    let environment = this;
    for (let i = 0; i < distance; i += 1) {
      environment = environment.enclosing;
    }

    return environment;
  }
}

module.exports = Environment;
