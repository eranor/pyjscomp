"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const tokens_1 = require("./tokens");
const TAB_WIDTH = 4;
const NUMBER_PATTERNS = {
    float: /^\d*\.(\d*)?|\d+\.\d+e[+-]\d+$/,
    integer: /^\d+$/
};
const checkNumber = (value) => {
    for (let [k, regex] of utils_1.entries(NUMBER_PATTERNS)) {
        if (regex.test(value)) {
            return true;
        }
    }
    return false;
};
const matchNumber = (value) => {
    for (let [k, regex] of utils_1.entries(NUMBER_PATTERNS)) {
        if (regex.test(value)) {
            return k;
        }
    }
};
const validTokenChar = (value) => {
    return /[a-zA-Z0-9_]/.test(value);
};
class Lexer {
    constructor(file, debug = false) {
        this.look = '';
        this.tokens = [];
        this.index = 0;
        this.position = 0;
        this.input = '';
        this.lexeme = '';
        this.implicit_join = false;
        this.indentationStack = new utils_1.Stack();
        this._positionOnLine = 0;
        this._lineCount = 1;
        this.input = file;
        this.indentationStack.push(0);
        if (debug) {
            this.next();
            this.scan();
        }
    }
    get positionOnLine() {
        return this._positionOnLine;
    }
    get lineCount() {
        return this._lineCount;
    }
    getNextToken() {
        if (this.tokens.length == 0) {
            this.next();
            this.scan();
            this.token_index = 0;
            return this.tokens[this.token_index];
        }
        if (++this.token_index < this.tokens.length) {
            return this.tokens[this.token_index];
        }
        else {
            return null;
        }
    }
    peekNextToken() {
        if ((this.token_index + 1) < this.tokens.length) {
            return this.tokens[this.token_index + 1];
        }
        else {
            return null;
        }
    }
    scan() {
        const whitespaceChars = constants_1.WHITESPACE_CHARS.values().reduce((a, v) => a.concat(v), []);
        while (this.look != constants_1.EOF) {
            while (whitespaceChars.indexOf(this.look) > -1 || this.look == constants_1.COMMENT_TOKEN_SINGLE) {
                if (constants_1.WHITESPACE_CHARS['NEWLINE'].indexOf(this.look) > -1) {
                    this.parseNewline();
                }
                else if (this.look == constants_1.COMMENT_TOKEN_SINGLE) {
                    this.parseComment();
                }
                else {
                    if (this._positionOnLine == 1 || /\s+/.test(this.lexeme)) {
                        this.lexeme += this.look;
                    }
                    this.next();
                }
            }
            let indentationLevel = this.lexeme.length;
            if (!this.implicit_join) {
                if (indentationLevel > this.indentationStack.top()) {
                    this.indentationStack.push(indentationLevel);
                    this.tokens.push(tokens_1.INDENT);
                }
            }
            if ((this._positionOnLine == 1) && (indentationLevel < this.indentationStack.top())) {
                while (indentationLevel < this.indentationStack.top()) {
                    this.indentationStack.pop();
                    this.tokens.push(tokens_1.DEDENT);
                }
            }
            /*if ((indentationLevel > 0) && (indentationLevel % TAB_WIDTH != 0) && (this.indentationStack.top() == 0)) {
                throw new Error('IndentationError: unexpected indent')
            }*/
            this.lexeme = '';
            if (checkNumber(this.look)) {
                this.scanNumber();
                this.tokens.push(new tokens_1.NumberLiteral(this.lexeme, matchNumber(this.lexeme)));
                this.lexeme = '';
                continue;
            }
            else if (tokens_1.OperatorSymbol.test(this.look)) {
                this.tokens.push(tokens_1.OperatorSymbol.matchToken(this.look));
                this.next();
            }
            else if (tokens_1.Symbol.test(this.look)) {
                this.tokens.push(tokens_1.Symbol.matchToken(this.look));
                this.next();
            }
            else if (tokens_1.Delimiter.test(this.look)) {
                this.tokens.push(tokens_1.Delimiter.matchToken(this.look));
                this.next();
            }
            else if (this.look == constants_1.SYMBOL_STRING_LITERAL_1 || this.look == constants_1.SYMBOL_STRING_LITERAL_2) {
                const start = this.look;
                this.next();
                while (this.look != start) {
                    this.lexeme += this.look;
                    this.next();
                }
                this.tokens.push(new tokens_1.StringLiteral(this.lexeme, this.look));
                this.lexeme = '';
                this.next();
                continue;
            }
            else if (this.look == constants_1.PARENTHESES_LEFT || this.look == constants_1.CURLY_BRACKET_LEFT || this.look == constants_1.SQUARE_BRACKET_LEFT) {
                this.implicit_join = true;
                this.tokens.push(tokens_1.BracketSymbol.matchToken(this.look));
                this.next();
                continue;
            }
            else if (this.look == constants_1.PARENTHESES_RIGHT || this.look == constants_1.CURLY_BRACKET_RIGHT || this.look == constants_1.SQUARE_BRACKET_RIGHT) {
                this.implicit_join = false;
                this.tokens.push(tokens_1.BracketSymbol.matchToken(this.look));
                this.next();
                continue;
            }
            else if (validTokenChar(this.look)) {
                while (validTokenChar(this.look)) {
                    this.lexeme += this.look;
                    this.next();
                }
            }
            else if (this.look != constants_1.EOF) {
                this.lexeme += this.look;
                this.next();
            }
            if (tokens_1.Keyword.test(this.lexeme)) {
                this.tokens.push(tokens_1.Keyword.matchToken(this.lexeme));
                this.lexeme = '';
            }
            if (this.lexeme != '') {
                let token = this.lexeme;
                if (typeof token == 'string') {
                    token = new tokens_1.Token('', this.lexeme, '');
                }
                this.tokens.push(token);
            }
            this.lexeme = '';
        }
        while (this.indentationStack.top() > 0) {
            this.indentationStack.pop();
            this.tokens.push(tokens_1.DEDENT);
        }
        if (this.look == constants_1.EOF) {
            this.tokens.push(tokens_1.ENDOFFILE);
        }
    }
    scanNumber() {
        while (true) {
            this.lexeme += this.look;
            this.next();
            if (this.look == constants_1.SCIENTIFIC_NOTATION_CHARACTER) {
                this.lexeme += this.look;
                this.next();
                if ([constants_1.OPERATOR_ADD, constants_1.OPERATOR_SUBRTACT].indexOf(this.look) > -1) {
                    this.lexeme += this.look;
                    this.next();
                }
            }
            if (!checkNumber(this.look)) {
                break;
            }
        }
    }
    next() {
        if (this.index >= this.input.length) {
            this.look = constants_1.EOF;
        }
        else {
            this.look = this.input[this.index];
            this.index += 1;
            this._positionOnLine += 1;
        }
    }
    parseNewline() {
        if (this._positionOnLine == 1 || /\s+/.test(this.lexeme)) {
            this.lexeme = '';
            if (this.look == constants_1.EOL_CR)
                this.next();
            if (this.look == constants_1.EOL_LF)
                this.next();
            return;
        }
        else {
            if (this.look == constants_1.EOL_CR)
                this.next();
            if (this.look == constants_1.EOL_LF)
                this.next();
            if (!this.implicit_join) {
                this.tokens.push(tokens_1.NEWLINE);
            }
            else {
                this.next();
            }
        }
        this._lineCount += 1;
        this._positionOnLine = 1;
    }
    parseComment() {
        this.next();
        while (constants_1.WHITESPACE_CHARS['NEWLINE'].indexOf(this.look) == -1) {
            this.next();
        }
        this.next();
    }
}
exports.default = Lexer;
//# sourceMappingURL=lexer.js.map