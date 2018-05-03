"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Ákos on 2017. 04. 25.
 */
const lodash_1 = require("lodash");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
class Token {
    constructor(name, value, type) {
        this.toString = () => {
            let temp = [`${this.constructor['name']}{'${this.value}'}`];
            if (`${lodash_1.startCase(this.type)}${this.name}` != '') {
                temp.push(`${lodash_1.startCase(this.type)}${this.name}`);
                temp.reverse();
            }
            return lodash_1.join(temp, '-');
        };
        this._name = name;
        this._value = value;
        this._type = type;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
}
exports.Token = Token;
exports.ENDOFFILE = new Token('EndOfFile', constants_1.EOF, '');
exports.NEWLINE = new Token('NewLine', 'NEWLINE', '');
exports.INDENT = new Token('Indent', 'INDENT', '');
exports.DEDENT = new Token('Dedent', 'DEDENT', '');
class Symbol extends Token {
    static test(value) {
        return value === constants_1.COMMENT_TOKEN_SINGLE;
    }
    static matchToken(value) {
        switch (value) {
            case constants_1.COMMENT_TOKEN_SINGLE:
                return new Symbol('Symbol', value, 'Comment');
            default: {
                return value;
            }
        }
    }
}
exports.Symbol = Symbol;
exports.BracketRegexOpen = '([{';
exports.BracketRegexClose = ')]}';
class BracketSymbol extends Symbol {
    constructor(value, type, side) {
        super('Bracket', value, type);
        this.toString = () => {
            return `${lodash_1.startCase(this.side)}${lodash_1.startCase(this.type)}${this.name}-Token{'${this.value}'}`;
        };
        this.side = side;
    }
    static test(value) {
        return [constants_1.SQUARE_BRACKET_RIGHT, constants_1.SQUARE_BRACKET_LEFT, constants_1.CURLY_BRACKET_RIGHT,
            constants_1.CURLY_BRACKET_LEFT, constants_1.PARENTHESES_RIGHT, constants_1.PARENTHESES_LEFT].indexOf(value) > -1;
    }
    static matchToken(value) {
        switch (value) {
            case constants_1.PARENTHESES_LEFT:
                return new BracketSymbol(value, 'round', 'open');
            case constants_1.PARENTHESES_RIGHT:
                return new BracketSymbol(value, 'round', 'close');
            case constants_1.SQUARE_BRACKET_LEFT:
                return new BracketSymbol(value, 'square', 'open');
            case constants_1.SQUARE_BRACKET_RIGHT:
                return new BracketSymbol(value, 'square', 'close');
            case constants_1.CURLY_BRACKET_LEFT:
                return new BracketSymbol(value, 'curly', 'open');
            case constants_1.CURLY_BRACKET_RIGHT: {
                return new BracketSymbol(value, 'curly', 'close');
            }
        }
        throw new errors_1.UnknownTokenError(`Token '${value}' is not a BracketSymbol.`);
    }
}
exports.BracketSymbol = BracketSymbol;
class OperatorSymbol extends Symbol {
    constructor(value, type) {
        super('Operator', value, type);
    }
    static test(value) {
        return [constants_1.OPERATOR_POWER, constants_1.OPERATOR_DIVISION, constants_1.OPERATOR_MULTIPLY, constants_1.OPERATOR_SUBRTACT,
            constants_1.OPERATOR_MODULO, constants_1.OPERATOR_ADD, constants_1.OPERATOR_LESSER, constants_1.OPERATOR_GREATER, constants_1.OPERATOR_NOT,
            constants_1.OPERATOR_EQUALS, constants_1.OPERATOR_NEGATE, constants_1.OPERATOR_AND, constants_1.OPERATOR_OR, constants_1.OPERATOR_IN].indexOf(value) > -1;
    }
    static matchToken(value) {
        switch (value) {
            case constants_1.OPERATOR_ADD:
                return new OperatorSymbol(value, 'add');
            case constants_1.OPERATOR_SUBRTACT:
                return new OperatorSymbol(value, 'subtract');
            case constants_1.OPERATOR_MULTIPLY:
                return new OperatorSymbol(value, 'multiply');
            case constants_1.OPERATOR_MODULO:
                return new OperatorSymbol(value, 'modulo');
            case constants_1.OPERATOR_DIVISION:
                return new OperatorSymbol(value, 'divide');
            case constants_1.OPERATOR_POWER:
                return new OperatorSymbol(value, 'power');
            case constants_1.OPERATOR_GREATER:
                return new OperatorSymbol(value, 'greater');
            case constants_1.OPERATOR_LESSER:
                return new OperatorSymbol(value, 'lesser');
            case constants_1.OPERATOR_EQUALS:
                return new OperatorSymbol(value, 'equals');
            case constants_1.OPERATOR_AND:
                return new OperatorSymbol(value, 'and');
            case constants_1.OPERATOR_OR:
                return new OperatorSymbol(value, 'or');
            case constants_1.OPERATOR_NEGATE:
                return new OperatorSymbol(value, 'negate');
            case constants_1.OPERATOR_NOT:
                return new OperatorSymbol(value, 'not');
            case constants_1.OPERATOR_IN:
                return new OperatorSymbol(value, 'in');
            default:
                return value;
        }
    }
}
exports.OperatorSymbol = OperatorSymbol;
class Delimiter extends Symbol {
    constructor(value, type) {
        super('Delimiter', value, type);
    }
    static test(value) {
        return [constants_1.SYMBOL_COMMA_DELIMIER, constants_1.SYMBOL_END_OF_DEFINITION, constants_1.SYMBOL_PERIOD, constants_1.SYMBOL_OXFORD_COMMA].indexOf(value) > -1;
    }
    static matchToken(value) {
        if (value == constants_1.SYMBOL_COMMA_DELIMIER) {
            return new Delimiter(value, 'comma');
        }
        else if (value == constants_1.SYMBOL_END_OF_DEFINITION) {
            return new Delimiter(value, 'colon');
        }
        else if (value == constants_1.SYMBOL_PERIOD) {
            return new Delimiter(value, 'period');
        }
        else if (value == constants_1.SYMBOL_OXFORD_COMMA) {
            return new Delimiter(value, 'oxfordcomma');
        }
        else {
            return value;
        }
    }
}
exports.Delimiter = Delimiter;
class Keyword extends Token {
    constructor(value) {
        super('Keyword', value, value);
    }
    static test(value) {
        return [constants_1.KEYWORD_DEF, constants_1.KEYWORD_FOR, constants_1.KEYWORD_WHILE, constants_1.KEYWORD_IF,
            constants_1.KEYWORD_ELIF, constants_1.KEYWORD_ELSE, constants_1.KEYWORD_TRUE, constants_1.KEYWORD_FALSE, constants_1.KEYWORD_RETURN,
            constants_1.KEYWORD_INPUT, constants_1.KEYWORD_PRINT, constants_1.KEYWORD_SQUAREROOT, constants_1.KEYWORD_LEN, constants_1.KEYWORD_NONE].indexOf(value) > -1;
    }
    static matchToken(value) {
        switch (value) {
            case constants_1.KEYWORD_DEF:
            case constants_1.KEYWORD_FOR:
            case constants_1.KEYWORD_WHILE:
            case constants_1.KEYWORD_IF:
            case constants_1.KEYWORD_ELIF:
            case constants_1.KEYWORD_ELSE:
            case constants_1.KEYWORD_TRUE:
            case constants_1.KEYWORD_FALSE:
            case constants_1.KEYWORD_NONE:
            case constants_1.KEYWORD_INPUT:
            case constants_1.KEYWORD_PRINT:
            case constants_1.KEYWORD_SQUAREROOT:
            case constants_1.KEYWORD_LEN:
            case constants_1.KEYWORD_RETURN:
                return new Keyword(value);
            default:
                return value;
        }
    }
}
exports.Keyword = Keyword;
class Literal {
    constructor(name, value, type) {
        this._name = name;
        this._value = value;
        this._type = type;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
}
exports.Literal = Literal;
class StringLiteral extends Literal {
    constructor(value, type = 'string') {
        super('String', value, '');
    }
}
exports.StringLiteral = StringLiteral;
class NumberLiteral extends Literal {
    constructor(value, type) {
        super('Number', parseInt(value), type);
    }
}
exports.NumberLiteral = NumberLiteral;
//# sourceMappingURL=tokens.js.map