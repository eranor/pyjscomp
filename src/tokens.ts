/**
 * Created by Ákos on 2017. 04. 25.
 */
import {join, startCase} from 'lodash'
import {
    COMMENT_TOKEN_SINGLE,
    CURLY_BRACKET_LEFT,
    CURLY_BRACKET_RIGHT,
    EOF,
    KEYWORD_DEF,
    KEYWORD_ELIF,
    KEYWORD_ELSE,
    KEYWORD_FALSE,
    KEYWORD_FOR,
    KEYWORD_IF,
    KEYWORD_INPUT,
    KEYWORD_LEN,
    KEYWORD_NONE,
    KEYWORD_PRINT, KEYWORD_RETURN,
    KEYWORD_SQUAREROOT,
    KEYWORD_TRUE,
    KEYWORD_WHILE,
    OPERATOR_ADD,
    OPERATOR_AND,
    OPERATOR_DIVISION,
    OPERATOR_EQUALS,
    OPERATOR_GREATER,
    OPERATOR_IN,
    OPERATOR_LESSER,
    OPERATOR_MODULO,
    OPERATOR_MULTIPLY,
    OPERATOR_NEGATE,
    OPERATOR_NOT,
    OPERATOR_OR,
    OPERATOR_POWER,
    OPERATOR_SUBRTACT,
    PARENTHESES_LEFT,
    PARENTHESES_RIGHT,
    SQUARE_BRACKET_LEFT,
    SQUARE_BRACKET_RIGHT,
    SYMBOL_COMMA_DELIMIER,
    SYMBOL_END_OF_DEFINITION,
    SYMBOL_OXFORD_COMMA,
    SYMBOL_PERIOD
} from './constants'
import {UnknownTokenError} from './errors'


export interface IToken {
    name: string
    value: any
    type: string
}

export class Token implements IToken {
    public toString = (): string => {
        let temp = [`${this.constructor['name']}{'${this.value}'}`]
        if (`${startCase(this.type)}${this.name}` != '') {
            temp.push(`${startCase(this.type)}${this.name}`)
            temp.reverse()
        }
        return join(temp, '-')
    }

    constructor(name: string, value: any, type: string) {
        this._name = name
        this._value = value
        this._type = type
    }

    private _name: string

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value
    }

    private _value: any

    get value(): any {
        return this._value
    }

    set value(value: any) {
        this._value = value
    }

    private _type: string

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value
    }

}

export const ENDOFFILE = new Token('EndOfFile', EOF, '')
export const NEWLINE = new Token('NewLine', 'NEWLINE', '')
export const INDENT = new Token('Indent', 'INDENT', '')
export const DEDENT = new Token('Dedent', 'DEDENT', '')

export class Symbol extends Token {

    public static test(value: string): boolean {
        return value === COMMENT_TOKEN_SINGLE
    }

    public static matchToken(value: string) {
        switch (value) {
            case COMMENT_TOKEN_SINGLE:
                return new Symbol('Symbol', value, 'Comment')
            default: {
                return value
            }
        }
    }
}

export type BracketType = 'open' | 'close';
export const BracketRegexOpen = '([{'
export const BracketRegexClose = ')]}'

export class BracketSymbol extends Symbol {
    public toString = (): string => {
        return `${startCase(this.side)}${startCase(this.type)}${this.name}-Token{'${this.value}'}`
    }
    private side: BracketType

    constructor(value: any, type: any, side: BracketType) {
        super('Bracket', value, type)
        this.side = side
    }

    public static test(value: string): boolean {
        return [SQUARE_BRACKET_RIGHT, SQUARE_BRACKET_LEFT, CURLY_BRACKET_RIGHT,
            CURLY_BRACKET_LEFT, PARENTHESES_RIGHT, PARENTHESES_LEFT].indexOf(value) > -1
    }

    public static matchToken(value: string) {
        switch (value) {
            case PARENTHESES_LEFT:
                return new BracketSymbol(value, 'round', 'open')
            case PARENTHESES_RIGHT:
                return new BracketSymbol(value, 'round', 'close')
            case SQUARE_BRACKET_LEFT:
                return new BracketSymbol(value, 'square', 'open')
            case SQUARE_BRACKET_RIGHT:
                return new BracketSymbol(value, 'square', 'close')
            case CURLY_BRACKET_LEFT:
                return new BracketSymbol(value, 'curly', 'open')
            case CURLY_BRACKET_RIGHT: {
                return new BracketSymbol(value, 'curly', 'close')
            }
        }
        throw new UnknownTokenError(`Token '${value}' is not a BracketSymbol.`)
    }
}

export class OperatorSymbol extends Symbol {
    constructor(value: any, type: any) {
        super('Operator', value, type)
    }

    public static test(value: string): boolean {
        return [OPERATOR_POWER, OPERATOR_DIVISION, OPERATOR_MULTIPLY, OPERATOR_SUBRTACT,
            OPERATOR_MODULO, OPERATOR_ADD, OPERATOR_LESSER, OPERATOR_GREATER, OPERATOR_NOT,
            OPERATOR_EQUALS, OPERATOR_NEGATE, OPERATOR_AND, OPERATOR_OR, OPERATOR_IN].indexOf(value) > -1
    }

    public static matchToken(value: string) {
        switch (value) {
            case OPERATOR_ADD:
                return new OperatorSymbol(value, 'add')
            case OPERATOR_SUBRTACT:
                return new OperatorSymbol(value, 'subtract')
            case OPERATOR_MULTIPLY:
                return new OperatorSymbol(value, 'multiply')
            case OPERATOR_MODULO:
                return new OperatorSymbol(value, 'modulo')
            case OPERATOR_DIVISION:
                return new OperatorSymbol(value, 'divide')
            case OPERATOR_POWER:
                return new OperatorSymbol(value, 'power')
            case OPERATOR_GREATER:
                return new OperatorSymbol(value, 'greater')
            case OPERATOR_LESSER:
                return new OperatorSymbol(value, 'lesser')
            case OPERATOR_EQUALS:
                return new OperatorSymbol(value, 'equals')
            case OPERATOR_AND:
                return new OperatorSymbol(value, 'and')
            case OPERATOR_OR:
                return new OperatorSymbol(value, 'or')
            case OPERATOR_NEGATE:
                return new OperatorSymbol(value, 'negate')
            case OPERATOR_NOT:
                return new OperatorSymbol(value, 'not')
            case OPERATOR_IN:
                return new OperatorSymbol(value, 'in')
            default:
                return value
        }
    }
}


export class Delimiter extends Symbol {

    constructor(value: any, type: any) {
        super('Delimiter', value, type)
    }

    public static test(value: string): boolean {
        return [SYMBOL_COMMA_DELIMIER, SYMBOL_END_OF_DEFINITION, SYMBOL_PERIOD, SYMBOL_OXFORD_COMMA].indexOf(value) > -1
    }

    public static matchToken(value: string) {
        if (value == SYMBOL_COMMA_DELIMIER) {
            return new Delimiter(value, 'comma')
        } else if (value == SYMBOL_END_OF_DEFINITION) {
            return new Delimiter(value, 'colon')
        } else if (value == SYMBOL_PERIOD) {
            return new Delimiter(value, 'period')
        } else if (value == SYMBOL_OXFORD_COMMA) {
            return new Delimiter(value, 'oxfordcomma')
        } else {
            return value
        }
    }
}


export interface ILiteral extends IToken {
}

export interface Identifier extends IToken {
}

export class Keyword extends Token implements Identifier {
    constructor(value: any) {
        super('Keyword', value, value)
    }

    public static test(value: string): boolean {
        return [KEYWORD_DEF, KEYWORD_FOR, KEYWORD_WHILE, KEYWORD_IF,
            KEYWORD_ELIF, KEYWORD_ELSE, KEYWORD_TRUE, KEYWORD_FALSE,KEYWORD_RETURN,
            KEYWORD_INPUT, KEYWORD_PRINT, KEYWORD_SQUAREROOT, KEYWORD_LEN, KEYWORD_NONE].indexOf(value) > -1
    }

    public static matchToken(value: string) {
        switch (value) {
            case KEYWORD_DEF:
            case KEYWORD_FOR:
            case KEYWORD_WHILE:
            case KEYWORD_IF:
            case KEYWORD_ELIF:
            case KEYWORD_ELSE:
            case KEYWORD_TRUE:
            case KEYWORD_FALSE:
            case KEYWORD_NONE:
            case KEYWORD_INPUT:
            case KEYWORD_PRINT:
            case KEYWORD_SQUAREROOT:
            case KEYWORD_LEN:
            case KEYWORD_RETURN:
                return new Keyword(value)
            default:
                return value
        }
    }
}

export class Literal implements ILiteral {
    constructor(name: string, value: any, type: string) {
        this._name = name
        this._value = value
        this._type = type
    }

    private _name: string

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value
    }

    private _value: any

    get value(): any {
        return this._value
    }

    set value(value: any) {
        this._value = value
    }

    private _type: string

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value
    }
}

export class StringLiteral extends Literal {

    constructor(value: any, type: any = 'string') {
        super('String', value, '')
    }
}

export class NumberLiteral extends Literal {

    constructor(value: any, type: any) {
        super('Number', parseInt(value), type)
    }
}
