class ParseError extends Error {}

class RuntimeError extends Error {
  constructor (token, message) {
    super(message);
    this.token = token;
  }
}

class Return extends Error {
  constructor (value) {
    super();
    this.value = value;
  }
}

module.exports = {
  ParseError,
  RuntimeError,
  Return
}
