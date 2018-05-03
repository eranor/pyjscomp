"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
const constants_1 = require("./constants");
const tokens_1 = require("./tokens");
const ast_1 = require("./ast");
const errors_1 = require("./errors");
const context_1 = require("./context");
class Compiler {
    constructor() {
        this.token_index = 0;
    }
    compile(code, rules = []) {
        this.token_index = 0;
        this.rules = rules;
        this.lexer = new lexer_1.default(code);
        return this.compile_inner(new context_1.Scope(this.rules));
    }
    compile_inner(scope) {
        let result = new ast_1.StatementList();
        this.nextToken();
        while (this.token != tokens_1.ENDOFFILE && this.token != null && this.token != tokens_1.DEDENT) {
            if (this.token.value == constants_1.KEYWORD_RETURN) {
                if (scope.isRoot()) {
                    throw new errors_1.SyntaxError('return outside of function');
                }
                this.nextToken();
                result.push(new ast_1.ReturnStatement(this.expresionSequence(scope)));
                if (this.checkNewline({ nextToken: false, checkEOF: true }))
                    return result;
                this.nextToken();
            }
            else if (this.token.value == constants_1.KEYWORD_IF) {
                result.push(this.ifOperation(scope));
            }
            else if (this.token.value == constants_1.KEYWORD_FOR) {
                throw new errors_1.NotImplementedError();
            }
            else if (this.token.value == constants_1.KEYWORD_WHILE) {
                this.nextToken();
                let condition = new ast_1.ExpressionStatement(this.booleanOrOperation(scope));
                if (this.token.value != constants_1.SYMBOL_END_OF_DEFINITION)
                    throw new errors_1.SyntaxError(`invalid syntax`);
                this.checkNewline({});
                this.checkIndent();
                result.push(new ast_1.WhileLoopStatement(condition, this.compile_inner(scope)));
                this.checkDedent();
            }
            else if (this.token.value == constants_1.KEYWORD_DEF) {
                this.nextToken();
                let name = this.token.value;
                this.nextToken();
                if (this.token.value != constants_1.PARENTHESES_LEFT)
                    throw new errors_1.SyntaxError('invalid syntax', this.token.value);
                this.nextToken();
                let args = [];
                scope.push({ name, type: 'function' });
                let localScope = new context_1.Scope(this.rules, scope);
                while (this.token.value != constants_1.PARENTHESES_RIGHT) {
                    args.push(this.token);
                    localScope.push({ name: this.token.value, type: 'variable' });
                    this.nextToken();
                    if (this.token.value == constants_1.SYMBOL_COMMA_DELIMIER) {
                        this.nextToken();
                    }
                }
                if (this.token.value != constants_1.PARENTHESES_RIGHT)
                    throw new errors_1.SyntaxError('invalid syntax', this.token.value);
                this.nextToken();
                if (this.token.value != constants_1.SYMBOL_END_OF_DEFINITION)
                    throw new errors_1.SyntaxError(`invalid syntax`, this.token.value);
                this.checkNewline({});
                this.checkIndent();
                let body = this.compile_inner(localScope);
                result.push(new ast_1.FunctionDefinitionStatement(name, args, body, localScope));
                this.checkDedent();
                this.nextToken();
            }
            else if (this.token.value == constants_1.KEYWORD_PRINT) {
                this.checkLeftParenth();
                this.nextToken();
                let body = new ast_1.ExpressionStatement(this.expresionSequence(scope));
                if (this.token.value != constants_1.PARENTHESES_RIGHT)
                    throw new errors_1.SyntaxError('invalid syntax', this.token.value);
                this.nextToken();
                result.push(new ast_1.PrintStatement(body));
                if (this.checkNewline({ nextToken: false, checkEOF: true }))
                    return result;
                this.nextToken();
            }
            else if (this.token instanceof tokens_1.Token) {
                let name = this.token.value;
                if (this.lexer.peekNextToken().value === constants_1.OPERATOR_EQUALS) {
                    this.nextToken();
                    this.nextToken();
                    const value = new ast_1.ExpressionStatement(this.booleanOrOperation(scope));
                    result.push(new ast_1.AssignmentStatement(name, value, scope.variableInParentTree(name)));
                    scope.push({ name, type: 'variable' });
                    if (this.checkNewline({ nextToken: false, checkEOF: true }))
                        return result;
                    this.nextToken();
                }
                else {
                    result.push(new ast_1.ExpressionStatement(this.booleanOrOperation(scope)));
                    if (this.checkNewline({ nextToken: false, checkEOF: true }))
                        return result;
                    this.nextToken();
                }
            }
            else if (this.token instanceof tokens_1.Literal) {
                result.push(new ast_1.ExpressionStatement(this.booleanOrOperation(scope)));
                if (this.checkNewline({ checkEOF: true }))
                    return result;
                this.nextToken();
            }
            else {
                if (this.token_index == 1 || this.token == tokens_1.NEWLINE) {
                    if (this.token == tokens_1.NEWLINE) {
                        this.nextToken();
                    }
                }
                else {
                    throw new errors_1.SyntaxError('invalid syntax');
                }
            }
        }
        return result;
    }
    checkEquals() {
        this.nextToken();
        if (this.token.value != constants_1.OPERATOR_EQUALS)
            throw new errors_1.SyntaxError('invalid syntax', this.token.value);
    }
    checkLeftParenth() {
        this.nextToken();
        if (this.token.value != constants_1.PARENTHESES_LEFT) {
            throw new errors_1.SyntaxError('invalid syntax', this.token.value);
        }
    }
    checkDefinitionEnd() {
        this.nextToken();
        if (this.token.value != constants_1.SYMBOL_END_OF_DEFINITION)
            throw new errors_1.SyntaxError(`invalid syntax`);
    }
    checkDedent() {
        if (this.token != tokens_1.DEDENT)
            throw new errors_1.IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value);
    }
    checkIndent() {
        this.nextToken();
        if (this.token != tokens_1.INDENT)
            throw new errors_1.IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value);
    }
    checkNewline({ nextToken = true, checkEOF = false }) {
        if (checkEOF && this.token === tokens_1.ENDOFFILE) {
            return true;
        }
        if (nextToken)
            this.nextToken();
        if (this.token != tokens_1.NEWLINE)
            throw new errors_1.IndentationError(this.lexer.positionOnLine, this.lexer.lineCount, this.token.value);
        return false;
    }
    nextToken() {
        this.token = this.lexer.getNextToken();
        this.token_index++;
    }
    ifOperation(scope) {
        let clauses = [];
        this.nextToken();
        let clauseExpression = new ast_1.ExpressionStatement(this.booleanOrOperation(scope));
        if (this.token.value != constants_1.SYMBOL_END_OF_DEFINITION)
            throw new errors_1.SyntaxError(`invalid syntax`);
        this.checkNewline({});
        this.checkIndent();
        let clauseBody = this.compile_inner(scope);
        clauses.push(new ast_1.Clause(clauseExpression, clauseBody));
        this.checkDedent();
        this.nextToken();
        if (this.token.value == constants_1.KEYWORD_ELIF) {
            this.nextToken();
            let clauseExpression2 = new ast_1.ExpressionStatement(this.booleanOrOperation(scope));
            if (this.token.value != constants_1.SYMBOL_END_OF_DEFINITION)
                throw new errors_1.SyntaxError(`invalid syntax`);
            this.checkNewline({});
            this.checkIndent();
            clauses.push(new ast_1.Clause(clauseExpression2, this.compile_inner(scope)));
            this.checkDedent();
            this.nextToken();
        }
        if (this.token.value == constants_1.KEYWORD_ELSE) {
            this.checkDefinitionEnd();
            this.checkNewline({});
            this.checkIndent();
            clauses.push(new ast_1.Clause(null, this.compile_inner(scope)));
            this.checkDedent();
            this.nextToken();
        }
        return new ast_1.IfStatement(clauses);
    }
    number(scope) {
        if (this.token instanceof tokens_1.Symbol) {
            throw new errors_1.SyntaxError('invalid syntax');
        }
        if (this.token instanceof tokens_1.Literal) {
            let result = new ast_1.Value(ast_1.ValueType[this.token.name], this.token);
            this.nextToken();
            return result;
        }
        else if (this.token instanceof ast_1.Enclosure) {
            let result = new ast_1.Atom(this.token);
            this.nextToken();
            return result;
        }
        else if (this.token instanceof tokens_1.Keyword) {
            if (this.token.value == constants_1.KEYWORD_TRUE || this.token.value == constants_1.KEYWORD_FALSE) {
                let result = new ast_1.Value(ast_1.ValueType.Boolean, this.token);
                this.nextToken();
                return result;
            }
            else if (this.token.value == constants_1.KEYWORD_NONE) {
                let result = new ast_1.Value(ast_1.ValueType.Null, this.token, 'null');
                this.nextToken();
                return result;
            }
            else {
                throw new errors_1.NotImplementedError();
            }
        }
        else if (this.token instanceof tokens_1.Token) {
            let nameToken = this.token;
            if (!scope.variableInParentTree(nameToken.value)) {
                throw new errors_1.NameError(nameToken.value);
            }
            this.nextToken();
            if (this.token.value === constants_1.PARENTHESES_LEFT) {
                this.nextToken();
                if (this.token.value === constants_1.PARENTHESES_RIGHT) {
                    this.nextToken();
                    return new ast_1.FunctionCallExpression(nameToken.value);
                }
                else {
                    if (this.token === tokens_1.DEDENT || this.token === tokens_1.NEWLINE || this.token === tokens_1.ENDOFFILE) {
                        throw new errors_1.SyntaxError('invalid syntax', this.token.value);
                    }
                    let sequenceExpression = this.expresionSequence(scope);
                    if (this.token.value != constants_1.PARENTHESES_RIGHT) {
                        throw new errors_1.SyntaxError('invalid syntax', this.token.value);
                    }
                    this.nextToken();
                    return new ast_1.FunctionCallExpression(nameToken.value, sequenceExpression);
                }
            }
            return new ast_1.AccessExpression(nameToken.value, nameToken);
        }
        else {
            throw new errors_1.SyntaxError('invalid syntax', this.token);
        }
    }
    bracket(scope) {
        if (this.token.value != constants_1.PARENTHESES_LEFT) {
            return this.number(scope);
        }
        else {
            this.nextToken();
            let result = new ast_1.Enclosure(this.booleanOrOperation(scope));
            if (this.token.value == constants_1.PARENTHESES_RIGHT) {
                this.nextToken();
            }
            else {
                throw new errors_1.SyntaxError('invalid syntax', this.token);
            }
            return result;
        }
    }
    negateOperation(scope) {
        if (this.token.value != constants_1.OPERATOR_SUBRTACT) {
            return this.bracket(scope);
        }
        else {
            this.nextToken();
            if (this.token.value == constants_1.OPERATOR_SUBRTACT) {
                throw new errors_1.SyntaxError('Unknown Operator', '--');
            }
            return new ast_1.Negate(this.bracket(scope));
        }
    }
    powerOperation(scope) {
        let result = this.negateOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_POWER) {
                this.nextToken();
                result = new ast_1.Power(result, this.negateOperation(scope));
            }
            else {
                return result;
            }
        }
    }
    mulDivModOperation(scope) {
        let result = this.powerOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_MULTIPLY) {
                this.nextToken();
                result = new ast_1.Multiplication(result, this.powerOperation(scope));
            }
            else if (this.token.value == constants_1.OPERATOR_DIVISION) {
                this.nextToken();
                result = new ast_1.Division(result, this.powerOperation(scope));
            }
            else if (this.token.value == constants_1.OPERATOR_MODULO) {
                this.nextToken();
                result = new ast_1.Modulo(result, this.powerOperation(scope));
            }
            else {
                return result;
            }
        }
    }
    addSubOperation(scope) {
        let result = this.mulDivModOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_ADD) {
                this.nextToken();
                result = new ast_1.Addition(result, this.mulDivModOperation(scope));
            }
            else if (this.token.value == constants_1.OPERATOR_SUBRTACT) {
                this.nextToken();
                result = new ast_1.Subtraction(result, this.mulDivModOperation(scope));
            }
            else {
                return result;
            }
        }
    }
    logicalCompareOperation(scope) {
        let result = this.addSubOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_LESSER) {
                this.nextToken();
                if (this.token.value == constants_1.OPERATOR_EQUALS) {
                    this.nextToken();
                    result = new ast_1.LessThanEquals(result, this.addSubOperation(scope));
                }
                else {
                    result = new ast_1.LessThan(result, this.addSubOperation(scope));
                }
            }
            else if (this.token.value == constants_1.OPERATOR_GREATER) {
                this.nextToken();
                if (this.token.value == constants_1.OPERATOR_EQUALS) {
                    this.nextToken();
                    result = new ast_1.GreaterThanEquals(result, this.addSubOperation(scope));
                }
                else {
                    result = new ast_1.GreaterThan(result, this.addSubOperation(scope));
                }
            }
            else if (this.token.value == constants_1.OPERATOR_EQUALS) {
                this.nextToken();
                if (this.token.value == constants_1.OPERATOR_EQUALS) {
                    this.nextToken();
                    result = new ast_1.Equals(result, this.addSubOperation(scope));
                }
            }
            else if (this.token.value == constants_1.OPERATOR_NOT) {
                this.nextToken();
                if (this.token.value == constants_1.OPERATOR_EQUALS) {
                    this.nextToken();
                    result = new ast_1.NotEquals(result, this.addSubOperation(scope));
                }
                else {
                    throw new errors_1.SyntaxError('invalid syntax', this.token);
                }
            }
            else {
                return result;
            }
        }
    }
    booleanNegationOperation(scope) {
        let result = this.logicalCompareOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_NEGATE) {
                this.nextToken();
                result = new ast_1.NotExpression(result);
            }
            else {
                return result;
            }
        }
    }
    booleanAndOperation(scope) {
        let result = this.booleanNegationOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_AND) {
                this.nextToken();
                result = new ast_1.AndExpression(result, this.booleanNegationOperation(scope));
            }
            else {
                return result;
            }
        }
    }
    booleanOrOperation(scope) {
        let result = this.booleanAndOperation(scope);
        while (true) {
            if (this.token.value == constants_1.OPERATOR_AND) {
                this.nextToken();
                result = new ast_1.OrExpression(result, this.booleanAndOperation(scope));
            }
            else {
                return result;
            }
        }
    }
    expresionSequence(scope) {
        let sequence = [this.booleanOrOperation(scope)];
        while (true) {
            if (this.token.value == constants_1.SYMBOL_COMMA_DELIMIER) {
                this.nextToken();
                sequence = [...sequence, this.booleanAndOperation(scope)];
            }
            else {
                return new ast_1.SequenceExpression(...sequence);
            }
        }
    }
}
exports.Compiler = Compiler;
//# sourceMappingURL=index.js.map