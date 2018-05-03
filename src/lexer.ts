import {entries, Stack} from './utils'
import {
    COMMENT_TOKEN_SINGLE,
    CURLY_BRACKET_LEFT,
    CURLY_BRACKET_RIGHT,
    EOF,
    EOL_CR,
    EOL_LF,
    OPERATOR_ADD,
    OPERATOR_SUBRTACT,
    PARENTHESES_LEFT,
    PARENTHESES_RIGHT,
    SCIENTIFIC_NOTATION_CHARACTER,
    SQUARE_BRACKET_LEFT,
    SQUARE_BRACKET_RIGHT,
    SYMBOL_STRING_LITERAL_1,
    SYMBOL_STRING_LITERAL_2,
    WHITESPACE_CHARS
} from './constants'
import {
    BracketSymbol,
    DEDENT,
    Delimiter,
    ENDOFFILE,
    INDENT,
    Keyword,
    NEWLINE,
    NumberLiteral,
    OperatorSymbol,
    StringLiteral,
    Symbol,
    Token
} from './tokens'


const TAB_WIDTH = 4

const NUMBER_PATTERNS = {
    float: /^\d*\.(\d*)?|\d+\.\d+e[+-]\d+$/,
    integer: /^\d+$/
}

const checkNumber = (value: string): boolean => {
    for (let [k, regex] of entries(NUMBER_PATTERNS)) {
        if (regex.test(value)) {
            return true
        }
    }
    return false
}

const matchNumber = (value: string): any => {
    for (let [k, regex] of entries(NUMBER_PATTERNS)) {
        if (regex.test(value)) {
            return k
        }
    }
}

const validTokenChar = (value: string): boolean => {
    return /[a-zA-Z0-9_]/.test(value)
}


export default class Lexer {
    look: string = ''
    tokens = []
    private index: number = 0
    private position: number = 0
    private input: string = ''
    private lexeme: any = ''
    private implicit_join: boolean = false
    private indentationStack: Stack<number> = new Stack<number>()
    private token_index: number

    constructor(file: string, debug: boolean = false) {
        this.input = file
        this.indentationStack.push(0)

        if (debug) {
            this.next()
            this.scan()
        }
    }

    private _positionOnLine: number = 0

    get positionOnLine(): number {
        return this._positionOnLine
    }

    private _lineCount: number = 1

    get lineCount(): number {
        return this._lineCount
    }

    getNextToken() {
        if (this.tokens.length == 0) {
            this.next()
            this.scan()
            this.token_index = 0
            return this.tokens[this.token_index]
        }
        if (++this.token_index < this.tokens.length) {
            return this.tokens[this.token_index]
        } else {
            return null
        }
    }

    peekNextToken() {
        if ((this.token_index + 1) < this.tokens.length) {
            return this.tokens[this.token_index + 1]
        } else {
            return null
        }
    }

    scan() {
        const whitespaceChars = WHITESPACE_CHARS.values().reduce((a, v) => a.concat(v), [])
        while (this.look != EOF) {
            while (whitespaceChars.indexOf(this.look) > -1 || this.look == COMMENT_TOKEN_SINGLE) {
                if (WHITESPACE_CHARS['NEWLINE'].indexOf(this.look) > -1) {
                    this.parseNewline()
                } else if (this.look == COMMENT_TOKEN_SINGLE) {
                    this.parseComment()
                } else {
                    if (this._positionOnLine == 1 || /\s+/.test(this.lexeme)) {
                        this.lexeme += this.look
                    }
                    this.next()
                }
            }
            let indentationLevel = this.lexeme.length
            if (!this.implicit_join) {
                if (indentationLevel > this.indentationStack.top()) {
                    this.indentationStack.push(indentationLevel)
                    this.tokens.push(INDENT)
                }
            }
            if ((this._positionOnLine === 1) && (indentationLevel < this.indentationStack.top())) {
                while (indentationLevel < this.indentationStack.top()) {
                    this.indentationStack.pop()
                    this.tokens.push(DEDENT)
                }
            }
            /*if ((indentationLevel > 0) && (indentationLevel % TAB_WIDTH != 0) && (this.indentationStack.top() == 0)) {
                throw new Error('IndentationError: unexpected indent')
            }*/
            this.lexeme = ''
            if (checkNumber(this.look)) {
                this.scanNumber()
                this.tokens.push(new NumberLiteral(this.lexeme, matchNumber(this.lexeme)))
                this.lexeme = ''
                continue
            } else if (OperatorSymbol.test(this.look)) {
                this.tokens.push(OperatorSymbol.matchToken(this.look))
                this.next()
            } else if (Symbol.test(this.look)) {
                this.tokens.push(Symbol.matchToken(this.look))
                this.next()
            } else if (Delimiter.test(this.look)) {
                this.tokens.push(Delimiter.matchToken(this.look))
                this.next()
            } else if (this.look == SYMBOL_STRING_LITERAL_1 || this.look == SYMBOL_STRING_LITERAL_2) {
                const start = this.look
                this.next()
                while (this.look != start) {
                    this.lexeme += this.look
                    this.next()
                }
                this.tokens.push(new StringLiteral(this.lexeme, this.look))
                this.lexeme = ''
                this.next()
                continue
            } else if (this.look == PARENTHESES_LEFT || this.look == CURLY_BRACKET_LEFT || this.look == SQUARE_BRACKET_LEFT) {
                this.implicit_join = true
                this.tokens.push(BracketSymbol.matchToken(this.look))
                this.next()
                continue
            } else if (this.look == PARENTHESES_RIGHT || this.look == CURLY_BRACKET_RIGHT || this.look == SQUARE_BRACKET_RIGHT) {
                this.implicit_join = false
                this.tokens.push(BracketSymbol.matchToken(this.look))
                this.next()
                continue
            } else if (validTokenChar(this.look)) {
                while (validTokenChar(this.look)) {
                    this.lexeme += this.look
                    this.next()
                }
            } else if (this.look != EOF) {
                this.lexeme += this.look
                this.next()
            }
            if (Keyword.test(this.lexeme)) {
                this.tokens.push(Keyword.matchToken(this.lexeme))
                this.lexeme = ''
            }
            if (this.lexeme != '') {
                let token: any = this.lexeme
                if (typeof token == 'string') {
                    token = new Token('', this.lexeme, '')
                }
                this.tokens.push(token)
            }
            this.lexeme = ''
        }

        while (this.indentationStack.top() > 0) {
            this.indentationStack.pop()
            this.tokens.push(DEDENT)
        }
        if (this.look == EOF) {
            this.tokens.push(ENDOFFILE)
        }

    }

    private scanNumber() {
        while (true) {
            this.lexeme += this.look
            this.next()
            if (this.look == SCIENTIFIC_NOTATION_CHARACTER) {
                this.lexeme += this.look
                this.next()
                if ([OPERATOR_ADD, OPERATOR_SUBRTACT].indexOf(this.look) > -1) {
                    this.lexeme += this.look
                    this.next()
                }
            }
            if (!checkNumber(this.look)) {
                break
            }
        }
    }

    private next() {
        if (this.index >= this.input.length) {
            this.look = EOF
        } else {
            this.look = this.input[this.index]
            this.index += 1
            this._positionOnLine += 1
        }
    }

    private parseNewline() {
        if (this._positionOnLine == 1 || /\s+/.test(this.lexeme)) {
            this.lexeme = ''
            if (this.look == EOL_CR) this.next()
            if (this.look == EOL_LF) this.next()
            return
        } else {
            if (this.look == EOL_CR) this.next()
            if (this.look == EOL_LF) this.next()
            if (!this.implicit_join) {
                this.tokens.push(NEWLINE)
            } else {
                this.next()
            }
        }
        this._lineCount += 1
        this._positionOnLine = 1
    }

    private parseComment() {
        this.next()
        while (WHITESPACE_CHARS['NEWLINE'].indexOf(this.look) == -1) {
            this.next()
        }
        this.next()
    }
}


