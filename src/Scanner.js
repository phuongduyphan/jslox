const {
  EOF,
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  STAR,
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  LESS,
  LESS_EQUAL,
  GREATER,
  GREATER_EQUAL,
  SLASH,
  STRING,
  NUMBER,
  AND,
  CLASS,
  ELSE,
  FALSE,
  FOR,
  FUN,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,
  IDENTIFIER
} = require('./tokenType');
const Token = require('./Token');

class Scanner {
  constructor (source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
    this.keywords = {
      and: AND,
      class: CLASS,
      else: ELSE,
      false: FALSE,
      for: FOR,
      fun: FUN,
      if: IF,
      nil: NIL,
      or: OR,
      print: PRINT,
      return: RETURN,
      super: SUPER,
      this: THIS,
      true: TRUE,
      var: VAR,
      while: WHILE
    }
    this.Lox = require('./Lox');
  }

  scanTokens () {
    while (!this.isAtEnd) {
      this.scanToken();
      this.start = this.current;
    }

    this.tokens.push(new Token(EOF, "", null, this.line));
    return this.tokens;
  }

  scanToken () {
    const c = this.advance();
    switch (c) {
      case '(':
        this.addToken(LEFT_PAREN);
        break;

      case ')':
        this.addToken(RIGHT_PAREN);
        break;

      case '{':
        this.addToken(LEFT_BRACE);
        break;

      case '}':
        this.addToken(RIGHT_BRACE);
        break;

      case ',':
        this.addToken(COMMA);
        break;

      case '.':
        this.addToken(DOT);
        break;

      case '-':
        this.addToken(MINUS);
        break;

      case '+':
        this.addToken(PLUS);
        break;

      case ';':
        this.addToken(SEMICOLON);
        break;

      case '*':
        this.addToken(STAR);
        break;

      case '!':
        this.addToken(this.match('=') ? BANG_EQUAL : BANG);
        break;

      case '=':
        this.addToken(this.match('=') ? EQUAL_EQUAL : EQUAL);
        break;

      case '<':
        this.addToken(this.match('=') ? LESS_EQUAL : LESS);
        break;

      case '>':
        this.addToken(this.match('=') ? GREATER_EQUAL : GREATER);
        break;

      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd) {
            this.advance();
          }
        } else {
          this.addToken(SLASH);
        }
        break;

      case ' ':
      case '\r':
      case '\t':
        // ignore whitespace
        break;

      case '\n':
        this.line += 1;
        break;

      case '"':
        this.string();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.Lox.error(this.line, `Unexpected character ${c}`);
        }

        break;
    }
  }

  advance () {
    this.current += 1;
    return this.source.charAt(this.current - 1);
  }

  match (expected) {
    if (this.isAtEnd) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current += 1;
    return true;
  }

  peek () {
    if (this.isAtEnd) {
      return '\0';
    }
    return this.source.charAt(this.current);
  }

  peekNext () {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }
    return this.source.charAt(this.current + 1);
  }

  string () {
    while (this.peek() != '"' && !this.isAtEnd) {
      if (this.peek() === '\n') {
        this.line += 1;
      }
      this.advance();
    }
    // unterminated string
    if (this.isAtEnd) {
      this.Lox.error(this.line, 'Unterminated string.');
      return;
    }
    // the closing "
    this.advance();
    // trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(STRING, value);
  }

  number () {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // look for fractional part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // consume the "."
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(NUMBER, parseFloat(this.source.substring(this.start, this.current)));
  }

  identifier () {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    // see if the identifier is a reserved word
    const text = this.source.substring(this.start, this.current);
    let type = this.keywords[text];
    if (!type) {
      type = IDENTIFIER;
    }
    this.addToken(type);
  }

  addToken (type, literal = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  isDigit (c) {
    return c >= '0' && c <= '9';
  }

  isAlpha (c) {
    return (c >= 'a' && c <= 'z')
      || (c >= 'A' && c <= 'Z')
      || c === '_';
  }

  isAlphaNumeric (c) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  get isAtEnd () {
    return this.current >= this.source.length;
  }
}

module.exports = Scanner;
