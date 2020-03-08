const LoxInstance = require('./LoxInstance');

class LoxClass {
  constructor (name, methods) {
    this.name = name;
    this.methods = methods;
  }

  arity () {
    const initializer = this.findMethod('init');
    if (!initializer) return 0;
    return initializer.arity();
  }

  call (interpreter, args) {
    const instance = new LoxInstance(this);

    const initializer = this.findMethod('init');
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  findMethod (name) {
    return this.methods.get(name);
  }

  toString () {
    return this.name;
  }
}

module.exports = LoxClass;
