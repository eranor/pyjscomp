"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Ákos on 2017. 04. 25.
 */
const tokens_1 = require("./tokens");
const errors_1 = require("./errors");
const constants_1 = require("./constants");
function uuidV4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
class Atom {
    constructor(token) {
        this.uuid = uuidV4();
        this._value = token.value;
        this._token = token;
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
    evaluate() {
        return this.value;
    }
    code() {
        return `${this.value}`;
    }
}
exports.Atom = Atom;
var ValueType;
(function (ValueType) {
    ValueType["String"] = "String";
    ValueType["Number"] = "Number";
    ValueType["Boolean"] = "Boolean";
    ValueType["Null"] = "Null";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
class Value extends Atom {
    constructor(type, token, value) {
        super(token);
        this.toString = () => {
            return `Value<${this.type}>[${this.value}]`;
        };
        this.type = type;
        this.value = value == null ? token.value : value;
    }
    evaluate() {
        switch (this.type) {
            case ValueType.String:
                return this.value;
            case ValueType.Number:
                return parseInt(this.value);
            case ValueType.Boolean:
                return this.value == constants_1.KEYWORD_TRUE ? true : !(this.value == constants_1.KEYWORD_FALSE);
            case ValueType.Null:
                return null;
            default:
                throw new errors_1.NotImplementedError();
        }
    }
    code() {
        switch (this.type) {
            case ValueType.String:
                return `'${this.value}'`;
            case ValueType.Number:
            case ValueType.Null:
                return this.value;
            case ValueType.Boolean:
                return this.value == constants_1.KEYWORD_TRUE ? 'true' : `${!(this.value == constants_1.KEYWORD_FALSE)}`;
            default:
                throw new errors_1.NotImplementedError();
        }
    }
}
exports.Value = Value;
class Enclosure {
    constructor(value) {
        this.uuid = uuidV4();
        this._value = value;
    }
    get value() {
        return this._value;
    }
    evaluate() {
        return this._value.evaluate();
    }
    code() {
        return `(${this.value.code()})`;
    }
}
exports.Enclosure = Enclosure;
class Expression {
    code() {
        throw new Error('Method not implemented.');
    }
    constructor(left, right) {
        this._uuid = uuidV4();
        this._left = left;
        this._right = right;
    }
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    evaluate() {
        this.left.evaluate();
    }
}
exports.Expression = Expression;
class UnaryExpression extends Expression {
}
exports.UnaryExpression = UnaryExpression;
class Negate extends UnaryExpression {
    evaluate() {
        return -this.left.evaluate();
    }
    code() {
        return `-${this.left.code()}`;
    }
}
exports.Negate = Negate;
class BinaryExpression extends Expression {
    constructor(left, right) {
        super(left, right);
    }
}
exports.BinaryExpression = BinaryExpression;
class Power extends BinaryExpression {
    evaluate() {
        return Math.pow(this.left.evaluate(), this.right.evaluate());
    }
    code() {
        return `${this.left.code()} ** ${this.right.code()}`;
    }
}
exports.Power = Power;
class Multiplication extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() * this.right.evaluate();
    }
    code() {
        return `${this.left.code()} * ${this.right.code()}`;
    }
}
exports.Multiplication = Multiplication;
class Division extends BinaryExpression {
    evaluate() {
        const right = this.right.evaluate();
        if (right == 0 || right == 0.0) {
            throw new errors_1.ZeroDivisionError();
        }
        return this.left.evaluate() / right;
    }
    code() {
        // TODO handle division by zero
        return `${this.left.code()} / ${this.right.code()}`;
    }
}
exports.Division = Division;
class Modulo extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() % this.right.evaluate();
    }
    code() {
        return `${this.left.code()} % ${this.right.code()}`;
    }
}
exports.Modulo = Modulo;
class Addition extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() + this.right.evaluate();
    }
    code() {
        return `${this.left.code()} + ${this.right.code()}`;
    }
}
exports.Addition = Addition;
class Subtraction extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() - this.right.evaluate();
    }
    code() {
        return `${this.left.code()} - ${this.right.code()}`;
    }
}
exports.Subtraction = Subtraction;
class ComparisonExpression extends BinaryExpression {
}
exports.ComparisonExpression = ComparisonExpression;
class LessThan extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() < this.right.evaluate();
    }
    code() {
        return `${this.left.code()} < ${this.right.code()}`;
    }
}
exports.LessThan = LessThan;
class GreaterThan extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() > this.right.evaluate();
    }
    code() {
        return `${this.left.code()} > ${this.right.code()}`;
    }
}
exports.GreaterThan = GreaterThan;
class Equals extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() == this.right.evaluate();
    }
    code() {
        return `${this.left.code()} === ${this.right.code()}`;
    }
}
exports.Equals = Equals;
class NotEquals extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() != this.right.evaluate();
    }
    code() {
        return `${this.left.code()} !== ${this.right.code()}`;
    }
}
exports.NotEquals = NotEquals;
class LessThanEquals extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() >= this.right.evaluate();
    }
    code() {
        return `${this.left.code()} >= ${this.right.code()}`;
    }
}
exports.LessThanEquals = LessThanEquals;
class GreaterThanEquals extends ComparisonExpression {
    evaluate() {
        return this.left.evaluate() <= this.right.evaluate();
    }
    code() {
        return `${this.left.code()} <= ${this.right.code()}`;
    }
}
exports.GreaterThanEquals = GreaterThanEquals;
class NotExpression extends UnaryExpression {
    evaluate() {
        return !this.left.evaluate();
    }
    code() {
        return `!${this.left.code()}`;
    }
}
exports.NotExpression = NotExpression;
class AndExpression extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() && this.right.evaluate();
    }
    code() {
        return `${this.left.code()} && ${this.right.code()}`;
    }
}
exports.AndExpression = AndExpression;
class OrExpression extends BinaryExpression {
    evaluate() {
        return this.left.evaluate() || this.right.evaluate();
    }
    code() {
        return `${this.left.code()} || ${this.right.code()}`;
    }
}
exports.OrExpression = OrExpression;
class AccessExpression extends Expression {
    constructor(name, left) {
        super(left, null);
        this.name = name;
    }
    evaluate() {
        //return GLOBALS.get(this.name)
    }
    code() {
        if (this.left instanceof tokens_1.StringLiteral) {
            return `'${this.left.value}'`;
        }
        else {
            return this.left.value;
        }
    }
}
exports.AccessExpression = AccessExpression;
class FunctionCallExpression extends Expression {
    constructor(name, args) {
        super(null, null);
        this.name = name;
        this.args = args;
    }
    code() {
        if (this.args) {
            return `${this.name}(${this.args.code()})`;
        }
        else {
            return `${this.name}()`;
        }
    }
}
exports.FunctionCallExpression = FunctionCallExpression;
class SequenceExpression extends Expression {
    constructor(...values) {
        super(null);
        this.values = values;
    }
    code() {
        return `${this.values.map(it => it.code()).join(',')}`;
    }
}
exports.SequenceExpression = SequenceExpression;
class ListExpression extends Expression {
    constructor(value) {
        super(null);
        this.value = value;
    }
    code() {
        return `[${this.value.code()}]`;
    }
}
exports.ListExpression = ListExpression;
class Statement {
    constructor(body) {
        this._uuid = uuidV4();
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
        if (this.body.body instanceof SequenceExpression) {
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
//# sourceMappingURL=ast.js.map