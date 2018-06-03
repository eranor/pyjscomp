"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const index_1 = require("./index");
const tokens_1 = require("../tokens");
const errors_1 = require("../errors");
class Statement {
    constructor(body) {
        this._uuid = utils_1.uuidV4();
        this._body = body;
    }
    get body() {
        return this._body;
    }
}
exports.Statement = Statement;
class ExpressionStatement extends Statement {
    constructor(body) {
        super(body);
    }
    exec() {
        return this.body.evaluate();
    }
    code() {
        return this.body.code();
    }
}
exports.ExpressionStatement = ExpressionStatement;
class AssignmentStatement extends Statement {
    constructor(name, left, declared = false) {
        super(left);
        this._name = name;
        this.declared = declared;
    }
    get name() {
        return this._name;
    }
    exec() {
        throw new errors_1.NotImplementedError();
    }
    code() {
        let value = `${this.body.code()}`;
        if (this.body.body._token instanceof tokens_1.StringLiteral) {
            value = `'${this.body.body._value}'`;
        }
        if (this.declared) {
            return `${this._name} = ${value}`;
        }
        else {
            return `let ${this._name} = ${value}`;
        }
    }
}
exports.AssignmentStatement = AssignmentStatement;
class CompoundStatement extends Statement {
    code() {
        return undefined;
    }
    exec() {
        return undefined;
    }
}
exports.CompoundStatement = CompoundStatement;
class ForLoopStatement extends CompoundStatement {
    constructor(variable, body, stop, start, step) {
        super(body);
        this.variable = variable;
        this.stop = stop;
        this.start = start;
        this.step = step;
    }
    code() {
        let start = this.start ? this.start.code() : 0;
        let step = this.step ? this.step.code() : 1;
        let helper = '(function(n,r,t){return 0<=t?n<r:r<=n})';
        return `for (let ${this.variable}=${start};${helper}(${this.variable},${this.stop.code()},${step});${this.variable}+=${step}){${this.body.code()}}`;
    }
}
exports.ForLoopStatement = ForLoopStatement;
class WhileLoopStatement extends CompoundStatement {
    constructor(statement, body) {
        super(body);
        this.test = statement;
    }
    exec() {
        while (this.test.exec() != true) {
            this.body.exec();
        }
    }
    code() {
        return `while (${this.test.code()}){${this.body.code()}}`;
    }
}
exports.WhileLoopStatement = WhileLoopStatement;
class Clause {
    constructor(statement = null, body) {
        this._statement = statement;
        this._body = body;
    }
    get statement() {
        return this._statement;
    }
    get body() {
        return this._body;
    }
    code() {
        return {
            body: this._body.code(),
            statement: this._statement == null ? null : this._statement.code()
        };
    }
}
exports.Clause = Clause;
class IfStatement extends CompoundStatement {
    constructor(clauses) {
        super();
        this.clauses = clauses;
    }
    exec() {
        for (let clause of this.clauses) {
            if (clause.statement.exec()) {
                return clause.body.exec();
            }
        }
    }
    code() {
        const clause1 = this.clauses[0].code();
        let result = `if (${clause1.statement}) { ${clause1.body} }`;
        for (let clause of this.clauses.slice(1)) {
            let cl = clause.code();
            if (clause.statement == null) {
                result += `else {${cl.body}}`;
            }
            else {
                result += `else if (${cl.statement}) {${cl.body}}`;
            }
        }
        return result;
    }
}
exports.IfStatement = IfStatement;
class FunctionDefinitionStatement extends CompoundStatement {
    constructor(name, args, body, scope) {
        super(body);
        this.name = name;
        this.args = args;
    }
    code() {
        return `function ${this.name}(${this.args.map(it => it.value).join(',')}){${this.body.code()}}`;
    }
}
exports.FunctionDefinitionStatement = FunctionDefinitionStatement;
class ReturnStatement extends CompoundStatement {
    constructor(value) {
        super(value);
    }
    code() {
        if (this.body.body instanceof index_1.SequenceExpression) {
            return `return [${this.body.code()}];`;
        }
        else {
            return `return ${this.body.code()};`;
        }
    }
}
exports.ReturnStatement = ReturnStatement;
class PrintStatement extends CompoundStatement {
    constructor(value) {
        super(value);
    }
    exec() {
        return this.body.exec();
    }
    code() {
        return `console.log(${this.body.code()})`;
    }
}
exports.PrintStatement = PrintStatement;
class LengthStatement extends CompoundStatement {
    constructor(value) {
        super(value);
    }
    exec() {
        return this.body.exec();
    }
    code() {
        return `${this.body.code()}.length`;
    }
}
exports.LengthStatement = LengthStatement;
class StatementList extends Statement {
    constructor() {
        super();
        this.expressions = [];
    }
    push(expressionStatement) {
        this.expressions.push(expressionStatement);
    }
    exec() {
        return this.expressions.map(expression => expression.exec());
    }
    code() {
        return this.expressions.map((it) => it.code()).join(';');
    }
}
exports.StatementList = StatementList;
//# sourceMappingURL=statements.js.map