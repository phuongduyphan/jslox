const LoxInstance = require('./LoxInstance');

class LoxClass {
  constructor (name, methods, superclass) {
    this.name = name;
    this.methods = methods;
    this.superclass = superclass;
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
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass) {
      return this.superclass.findMethod(name);
    }

    return null;
  }

  toString () {
    return this.name;
  }
}

module.exports = LoxClass;
