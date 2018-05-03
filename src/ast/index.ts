/**
 * Created by Ákos on 2017. 04. 25.
 */
import {Identifier, ILiteral, IToken, StringLiteral} from '../tokens'
import {NotImplementedError, ZeroDivisionError} from '../errors'
import {KEYWORD_FALSE, KEYWORD_TRUE} from '../constants'
import {uuidV4} from '../utils'

export class Atom implements Transpileable {
    protected _token: Identifier | ILiteral | Enclosure
    private uuid = uuidV4()

    constructor(token: Identifier | ILiteral | Enclosure) {
        this._value = token.value
        this._token = token
    }

    protected _value: any

    get value() {
        return this._value
    }

    set value(v) {
        this._value = v
    }

    evaluate() {
        return this.value
    }

    code() {
        return `${this.value}`
    }
}

export enum ValueType {
    String = 'String', Number = 'Number', Boolean = 'Boolean', Null = 'Null'
}

export class Value extends Atom {
    value: any
    type: ValueType
    public toString = (): string => {
        return `Value<${this.type}>[${this.value}]`
    }

    constructor(type: ValueType, token: IToken, value?: any) {
        super(token)
        this.type = type
        this.value = value == null ? token.value : value
    }

    evaluate() {
        switch (this.type) {
            case ValueType.String:
                return this.value
            case ValueType.Number:
                return parseInt(this.value)
            case ValueType.Boolean:
                return this.value == KEYWORD_TRUE ? true : !(this.value == KEYWORD_FALSE)
            case ValueType.Null:
                return null
            default:
                throw new NotImplementedError()
        }
    }

    code() {
        switch (this.type) {
            case ValueType.String:
                return `'${this.value}'`
            case ValueType.Number:
            case ValueType.Null:
                return this.value
            case ValueType.Boolean:
                return this.value == KEYWORD_TRUE ? 'true' : `${!(this.value == KEYWORD_FALSE)}`
            default:
                throw new NotImplementedError()
        }
    }
}

export class Enclosure implements Transpileable {
    private uuid = uuidV4()

    constructor(value: Identifier | ILiteral | Enclosure) {
        this._value = value
    }

    private _value: any

    get value() {
        return this._value
    }

    evaluate() {
        return this._value.evaluate()
    }

    code(): any {
        return `(${this.value.code()})`
    }

}

export abstract class Expression implements Transpileable {
    private _uuid: string

    code() {
        throw new Error('Method not implemented.')
    }

    constructor(left: any, right?: any) {
        this._uuid = uuidV4()
        this._left = left
        this._right = right
    }

    private _left: Atom

    get left() {
        return this._left
    }

    private _right: Atom

    get right() {
        return this._right
    }

    evaluate() {
        this.left.evaluate()
    }
}

export abstract class UnaryExpression extends Expression {
}

export class Negate extends UnaryExpression {
    evaluate(): any {
        return -this.left.evaluate()
    }

    code(): any {
        return `-${this.left.code()}`
    }
}

export abstract class BinaryExpression extends Expression {
    constructor(left: any, right: any) {
        super(left, right)
    }
}

export class Power extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() ** this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} ** ${this.right.code()}`
    }
}

export class Multiplication extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() * this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} * ${this.right.code()}`
    }
}

export class Division extends BinaryExpression {
    evaluate(): any {
        const right = this.right.evaluate()
        if (right == 0 || right == 0.0) {
            throw new ZeroDivisionError()
        }
        return this.left.evaluate() / right
    }

    code(): any {
        // TODO handle division by zero
        return `${this.left.code()} / ${this.right.code()}`
    }
}

export class Modulo extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() % this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} % ${this.right.code()}`
    }
}

export class Addition extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() + this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} + ${this.right.code()}`
    }
}

export class Subtraction extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() - this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} - ${this.right.code()}`
    }
}

export abstract class ComparisonExpression extends BinaryExpression {
}

export class LessThan extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() < this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} < ${this.right.code()}`
    }
}

export class GreaterThan extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() > this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} > ${this.right.code()}`
    }
}

export class Equals extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() == this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} === ${this.right.code()}`
    }
}

export class NotEquals extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() != this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} !== ${this.right.code()}`
    }
}

export class LessThanEquals extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() >= this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} >= ${this.right.code()}`
    }
}

export class GreaterThanEquals extends ComparisonExpression {
    evaluate(): any {
        return this.left.evaluate() <= this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} <= ${this.right.code()}`
    }
}

export class NotExpression extends UnaryExpression {
    evaluate(): any {
        return !this.left.evaluate()
    }

    code(): any {
        return `!${this.left.code()}`
    }
}

export class AndExpression extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() && this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} && ${this.right.code()}`
    }
}

export class OrExpression extends BinaryExpression {
    evaluate(): any {
        return this.left.evaluate() || this.right.evaluate()
    }

    code(): any {
        return `${this.left.code()} || ${this.right.code()}`
    }
}

export class AccessExpression extends Expression {

    name: string

    constructor(name: string, left: any) {
        super(left, null)
        this.name = name
    }

    evaluate() {
        //return GLOBALS.get(this.name)
    }

    code(): any {
        if (this.left instanceof StringLiteral) {
            return `'${this.left.value}'`
        } else {
            return this.left.value
        }

    }
}

export class FunctionCallExpression extends Expression implements Transpileable {
    private args: Expression
    name: string

    constructor(name: string, args?: Expression) {
        super(null, null)
        this.name = name
        this.args = args
    }

    code(): any {
        if (this.args) {
            return `${this.name}(${this.args.code()})`
        } else {
            return `${this.name}()`
        }
    }
}

export class SequenceExpression extends Expression implements Transpileable {
    private values: Expression[]

    constructor(...values: Expression[]) {
        super(null)
        this.values = values
    }

    code(): any {
        return `${this.values.map(it => it.code()).join(',')}`
    }
}

export class ListExpression extends Expression implements Transpileable {
    private value: Expression

    constructor(value: Expression) {
        super(null)
        this.value = value
    }

    code(): any {
        return `[${this.value.code()}]`
    }
}

export interface Executable {
    exec(): any;
}

export interface Transpileable {
    code(): any;
}


