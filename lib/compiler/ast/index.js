"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Ákos on 2017. 04. 25.
 */
const tokens_1 = require("../tokens");
const errors_1 = require("../errors");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class Atom {
    constructor(token) {
        this.uuid = utils_1.uuidV4();
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
        this.uuid = utils_1.uuidV4();
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
        this._uuid = utils_1.uuidV4();
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
//# sourceMappingURL=index.js.map