import Lexer from './lexer'
import {
    KEYWORD_DEF,
    KEYWORD_ELIF,
    KEYWORD_ELSE,
    KEYWORD_FALSE,
    KEYWORD_FOR,
    KEYWORD_IF,
    KEYWORD_NONE,
    KEYWORD_PRINT,
    KEYWORD_RETURN,
    KEYWORD_TRUE,
    KEYWORD_WHILE,
    OPERATOR_ADD,
    OPERATOR_AND,
    OPERATOR_DIVISION,
    OPERATOR_EQUALS,
    OPERATOR_GREATER,
    OPERATOR_LESSER,
    OPERATOR_MODULO,
    OPERATOR_MULTIPLY,
    OPERATOR_NEGATE,
    OPERATOR_NOT,
    OPERATOR_POWER,
    OPERATOR_SUBRTACT,
    PARENTHESES_LEFT,
    PARENTHESES_RIGHT,
    SYMBOL_COMMA_DELIMIER,
    SYMBOL_END_OF_DEFINITION
} from './constants'
import {DEDENT, ENDOFFILE, INDENT, IToken, Keyword, Literal, NEWLINE, Symbol, Token} from './tokens'
import {
    AccessExpression,
    Addition,
    AndExpression,
    Atom,
    Division,
    Enclosure,
    Equals,
    FunctionCallExpression,
    GreaterThan,
    GreaterThanEquals,
    LessThan,
    LessThanEquals,
    Modulo,
    Multiplication,
    Negate,
    NotEquals,
    NotExpression,
    OrExpression,
    Power,
    SequenceExpression,
    Subtraction,
    Value,
    ValueType} from './ast/index'
import {IndentationError, NameError, NotImplementedError, SyntaxError} from './errors'
import {Scope} from './context'
import {Rule} from './rule'
import {
    AssignmentStatement,
    Clause,
    ExpressionStatement,
    FunctionDefinitionStatement,
    IfStatement, PrintStatement, ReturnStatement, StatementList,
    WhileLoopStatement
} from './ast/statements'

declare function require(name: string);

export class Compiler {
    private lexer: Lexer
    private token: IToken
    private state: any
    private token_index: number = 0
    private rules: Rule[]

    constructor() {
    }

    public compile(code?: string, rules: Rule[] = []): StatementList {
        this.token_index = 0
        this.rules = rules
        this.lexer = new Lexer(code)
        return this.compile_inner(new Scope(this.rules))
    }

    public compile_inner(scope: Scope): StatementList {
        let result = new StatementList()
        this.nextToken()

        while (this.token != ENDOFFILE && this.token != null && this.token != DEDENT) {
            if (this.token.value == KEYWORD_RETURN) {
                if (scope.isRoot()) {
                    throw new SyntaxError('return outside of function')
                }
                this.nextToken()
                result.push(new ReturnStatement(this.expresionSequence(scope)))
                if (this.checkNewline({nextToken: false, checkEOF: true})) return result
                this.nextToken()
            } else if (this.token.value == KEYWORD_IF) {
                result.push(this.ifOperation(scope))
            } else if (this.token.value == KEYWORD_FOR) {
                throw new NotImplementedError()
            } else if (this.token.value == KEYWORD_WHILE) {
                this.nextToken()
                let condition = new ExpressionStatement(this.booleanOrOperation(scope))
                if (this.token.value != SYMBOL_END_OF_DEFINITION) throw new SyntaxError(`invalid syntax`, this.token.value)
                this.checkNewline({})
                this.checkIndent()
                result.push(new WhileLoopStatement(condition, this.compile_inner(scope)))
                this.checkDedent()
            } else if (this.token.value == KEYWORD_DEF) {
                this.nextToken()
                let name = this.token.value
                this.nextToken()
                if (this.token.value != PARENTHESES_LEFT) throw new SyntaxError('invalid syntax', this.token.value)
                this.nextToken()
                let args = []
                scope.push({name, type: 'function'})
                let localScope = new Scope(this.rules, scope)
                while (this.token.value != PARENTHESES_RIGHT) {
                    args.push(this.token)
                    localScope.push({name: this.token.value, type: 'variable'})
                    this.nextToken()
                    if (this.token.value == SYMBOL_COMMA_DELIMIER) {
                        this.nextToken()
                    }
                }
                if (this.token.value != PARENTHESES_RIGHT) throw new SyntaxError('invalid syntax', this.token.value)
                this.nextToken()
                if (this.token.value != SYMBOL_END_OF_DEFINITION) throw new SyntaxError(`invalid syntax`, this.token.value)
                this.checkNewline({})
                this.checkIndent()
                let body = this.compile_inner(localScope)
                result.push(new FunctionDefinitionStatement(name, args, body, localScope))
                this.checkDedent()
                this.nextToken()
            } else if (this.token.value == KEYWORD_PRINT) {
                this.checkLeftParenth()
                this.nextToken()
                let body = new ExpressionStatement(this.expresionSequence(scope))
                if (this.token.value != PARENTHESES_RIGHT) throw new SyntaxError('invalid syntax', this.token.value)
                this.nextToken()
                result.push(new PrintStatement(body))
                if (this.checkNewline({nextToken: false, checkEOF: true})) return result
                this.nextToken()
            } else if (this.token instanceof Token) {
                let name = this.token.value
                if (this.lexer.peekNextToken().value === OPERATOR_EQUALS) {
                    this.nextToken()
                    this.nextToken()
                    const value = new ExpressionStatement(this.booleanOrOperation(scope))
                    result.push(new AssignmentStatement(name, value, scope.variableInParentTree(name)))
                    scope.push({name, type: 'variable'})
                    if (this.checkNewline({nextToken: false, checkEOF: true})) return result
                    this.nextToken()
                } else {
                    result.push(new ExpressionStatement(this.booleanOrOperation(scope)))
                    if (this.checkNewline({nextToken: false, checkEOF: true})) return result
                    this.nextToken()
                }
            } else if (this.token instanceof Literal) {
                result.push(new ExpressionStatement(this.booleanOrOperation(scope)))
                if (this.checkNewline({checkEOF: true})) return result
                this.nextToken()
            } else {
                if (this.token_index == 1 || this.token == NEWLINE) {
                    if (this.token == NEWLINE) {
                        this.nextToken()
                    }
                } else {
                    throw new SyntaxError('invalid syntax')
                }
            }
        }
        return result
    }

    private checkEquals() {
        this.nextToken()
        if (this.token.value != OPERATOR_EQUALS) throw new SyntaxError('invalid syntax', this.token.value)
    }

    private checkLeftParenth() {
        this.nextToken()
        if (this.token.value != PARENTHESES_LEFT) {
            throw new SyntaxError('invalid syntax', this.token.value)
        }
    }

    private checkDefinitionEnd() {
        this.nextToken()
        if (this.token.value != SYMBOL_END_OF_DEFINITION) throw new SyntaxError(`invalid syntax`)
    }

    private checkDedent() {
        if (this.token != DEDENT) throw new IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value)
    }

    private checkIndent() {
        this.nextToken()
        if (this.token != INDENT) throw new IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value)
    }

    private checkNewline({nextToken = true, checkEOF = false}) {
        if (checkEOF && this.token === ENDOFFILE) {
            return true
        }
        if (nextToken) this.nextToken()
        if (this.token != NEWLINE) throw new IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value)
        return false
    }

    private nextToken() {
        this.token = this.lexer.getNextToken()
        this.token_index++
    }

    private ifOperation(scope: Scope) {
        let clauses = []
        this.nextToken()
        let clauseExpression = new ExpressionStatement(this.booleanOrOperation(scope))
        if (this.token.value != SYMBOL_END_OF_DEFINITION) throw new SyntaxError(`invalid syntax`)
        this.checkNewline({})
        this.checkIndent()
        let clauseBody = this.compile_inner(scope)
        clauses.push(new Clause(clauseExpression, clauseBody))
        this.checkDedent()
        this.nextToken()
        if (this.token.value == KEYWORD_ELIF) {
            this.nextToken()
            let clauseExpression2 = new ExpressionStatement(this.booleanOrOperation(scope))
            if (this.token.value != SYMBOL_END_OF_DEFINITION) throw new SyntaxError(`invalid syntax`)
            this.checkNewline({})
            this.checkIndent()
            clauses.push(new Clause(clauseExpression2, this.compile_inner(scope)))
            this.checkDedent()
            this.nextToken()
        }
        if (this.token.value == KEYWORD_ELSE) {
            this.checkDefinitionEnd()
            this.checkNewline({})
            this.checkIndent()
            clauses.push(new Clause(null, this.compile_inner(scope)))
            this.checkDedent()
            this.nextToken()
        }
        return new IfStatement(clauses)
    }

    private number(scope: Scope): Value | Atom | AccessExpression {
        if (this.token instanceof Symbol) {
            throw new SyntaxError('invalid syntax')
        }
        if (this.token instanceof Literal) {
            let result = new Value(ValueType[this.token.name], this.token)
            this.nextToken()
            return result
        } else if (this.token instanceof Enclosure) {
            let result = new Atom(this.token)
            this.nextToken()
            return result
        } else if (this.token instanceof Keyword) {
            if (this.token.value == KEYWORD_TRUE || this.token.value == KEYWORD_FALSE) {
                let result = new Value(ValueType.Boolean, this.token)
                this.nextToken()
                return result
            } else if (this.token.value == KEYWORD_NONE) {
                let result = new Value(ValueType.Null, this.token, 'null')
                this.nextToken()
                return result
            } else {
                throw new NotImplementedError()
            }
        } else if (this.token instanceof Token) {
            let nameToken = this.token
            if (!scope.variableInParentTree(nameToken.value)) {
                throw new NameError(nameToken.value)
            }
            this.nextToken()
            if (this.token.value === PARENTHESES_LEFT) {
                this.nextToken()
                if (this.token.value === PARENTHESES_RIGHT) {
                    this.nextToken()
                    return new FunctionCallExpression(nameToken.value)
                } else {
                    if (this.token === DEDENT || this.token === NEWLINE || this.token === ENDOFFILE) {
                        throw new SyntaxError('invalid syntax', this.token.value)
                    }
                    let sequenceExpression = this.expresionSequence(scope)

                    if (this.token.value != PARENTHESES_RIGHT) {
                        throw new SyntaxError('invalid syntax', this.token.value)
                    }
                    this.nextToken()
                    return new FunctionCallExpression(nameToken.value, sequenceExpression)
                }
            }
            return new AccessExpression(nameToken.value, nameToken)
        } else {
            throw new SyntaxError('invalid syntax', this.token)
        }
    }

    private bracket(scope: Scope) {
        if (this.token.value != PARENTHESES_LEFT) {
            return this.number(scope)
        } else {
            this.nextToken()
            let result = new Enclosure(this.booleanOrOperation(scope))
            if (this.token.value == PARENTHESES_RIGHT) {
                this.nextToken()
            } else {
                throw new SyntaxError('invalid syntax', this.token)
            }
            return result
        }
    }

    private negateOperation(scope: Scope) {
        if (this.token.value != OPERATOR_SUBRTACT) {
            return this.bracket(scope)
        } else {
            this.nextToken()
            if (this.token.value == OPERATOR_SUBRTACT) {
                throw new SyntaxError('Unknown Operator', '--')
            }
            return new Negate(this.bracket(scope))
        }
    }

    private powerOperation(scope: Scope) {
        let result = this.negateOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_POWER) {
                this.nextToken()
                result = new Power(result, this.negateOperation(scope))
            } else {
                return result
            }
        }

    }

    private mulDivModOperation(scope: Scope) {
        let result = this.powerOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_MULTIPLY) {
                this.nextToken()
                result = new Multiplication(result, this.powerOperation(scope))
            } else if (this.token.value == OPERATOR_DIVISION) {
                this.nextToken()
                result = new Division(result, this.powerOperation(scope))
            } else if (this.token.value == OPERATOR_MODULO) {
                this.nextToken()
                result = new Modulo(result, this.powerOperation(scope))
            } else {
                return result
            }
        }

    }

    private addSubOperation(scope: Scope) {
        let result = this.mulDivModOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_ADD) {
                this.nextToken()
                result = new Addition(result, this.mulDivModOperation(scope))
            } else if (this.token.value == OPERATOR_SUBRTACT) {
                this.nextToken()
                result = new Subtraction(result, this.mulDivModOperation(scope))
            } else {
                return result
            }
        }
    }

    private logicalCompareOperation(scope: Scope) {
        let result = this.addSubOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_LESSER) {
                this.nextToken()
                if (this.token.value == OPERATOR_EQUALS) {
                    this.nextToken()
                    result = new LessThanEquals(result, this.addSubOperation(scope))
                } else {
                    result = new LessThan(result, this.addSubOperation(scope))
                }
            } else if (this.token.value == OPERATOR_GREATER) {
                this.nextToken()
                if (this.token.value == OPERATOR_EQUALS) {
                    this.nextToken()
                    result = new GreaterThanEquals(result, this.addSubOperation(scope))
                } else {
                    result = new GreaterThan(result, this.addSubOperation(scope))
                }
            } else if (this.token.value == OPERATOR_EQUALS) {
                this.nextToken()
                if (this.token.value == OPERATOR_EQUALS) {
                    this.nextToken()
                    result = new Equals(result, this.addSubOperation(scope))
                }
            } else if (this.token.value == OPERATOR_NOT) {
                this.nextToken()
                if (this.token.value == OPERATOR_EQUALS) {
                    this.nextToken()
                    result = new NotEquals(result, this.addSubOperation(scope))
                } else {
                    throw new SyntaxError('invalid syntax', this.token)
                }
            } else {
                return result
            }
        }
    }

    private booleanNegationOperation(scope: Scope) {
        let result = this.logicalCompareOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_NEGATE) {
                this.nextToken()
                result = new NotExpression(result)
            } else {
                return result
            }
        }
    }

    private booleanAndOperation(scope: Scope) {
        let result = this.booleanNegationOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_AND) {
                this.nextToken()
                result = new AndExpression(result, this.booleanNegationOperation(scope))
            } else {
                return result
            }
        }
    }

    private booleanOrOperation(scope: Scope) {
        let result = this.booleanAndOperation(scope)
        while (true) {
            if (this.token.value == OPERATOR_AND) {
                this.nextToken()
                result = new OrExpression(result, this.booleanAndOperation(scope))
            } else {
                return result
            }
        }
    }

    private expresionSequence(scope: Scope) {
        let sequence = [this.booleanOrOperation(scope)]
        while (true) {
            if (this.token.value == SYMBOL_COMMA_DELIMIER) {
                this.nextToken()
                sequence = [...sequence, this.booleanAndOperation(scope)]
            } else {
                return new SequenceExpression(...sequence)
            }
        }
    }
}
