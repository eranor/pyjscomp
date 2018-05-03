import {uuidV4} from '../utils'
import {Executable, Expression, SequenceExpression, Transpileable} from './index'
import {StringLiteral, Token} from '../tokens'
import {Scope} from '../context'
import {NotImplementedError} from '../errors'

export abstract class Statement implements Executable, Transpileable {
    private _uuid: string

    constructor(body?: any) {
        this._uuid = uuidV4()
        this._body = body
    }

    private _body: any

    get body(): any {
        return this._body
    }

    abstract exec(): any;

    abstract code(): any;
}

export class ExpressionStatement extends Statement {
    constructor(body: any) {
        super(body)
    }

    exec(): any {
        return this.body.evaluate()
    }

    code(): any {
        return this.body.code()
    }
}

export class AssignmentStatement extends Statement {
    private declared: boolean

    constructor(name: string, left: ExpressionStatement, declared = false) {
        super(left)
        this._name = name
        this.declared = declared
    }

    private _name: string

    get name(): string {
        return this._name
    }

    exec(): any {
        throw new NotImplementedError()
    }

    code(): any {
        let value = `${this.body.code()}`
        if (this.body.body._token instanceof StringLiteral) {
            value = `'${this.body.body._value}'`
        }
        if (this.declared) {
            return `${this._name} = ${value}`
        } else {
            return `let ${this._name} = ${value}`
        }

    }

}

export class CompoundStatement extends Statement {
    code(): any {
        return undefined
    }

    exec(): any {
        return undefined
    }

}

export class ForLoopStatement extends CompoundStatement {

}

export class WhileLoopStatement extends CompoundStatement {
    test: ExpressionStatement
    body: StatementList

    constructor(statement: ExpressionStatement, body: StatementList) {
        super(body)
        this.test = statement
    }

    exec() {
        while (this.test.exec() != true) {
            this.body.exec()
        }
    }

    code() {
        return `while (${this.test.code()}){${this.body.code()}}`
    }

}

export class Clause {
    constructor(statement: ExpressionStatement = null, body: Statement) {
        this._statement = statement
        this._body = body
    }

    private _statement?: ExpressionStatement

    get statement(): ExpressionStatement {
        return this._statement
    }

    private _body: Statement

    get body(): Statement {
        return this._body
    }

    code() {
        return {
            body: this._body.code(),
            statement: this._statement == null ? null : this._statement.code()
        }
    }
}

export class IfStatement extends CompoundStatement {
    clauses: Clause[]

    constructor(clauses: Clause[]) {
        super()
        this.clauses = clauses
    }

    exec(): any {
        for (let clause of this.clauses) {
            if (clause.statement.exec()) {
                return clause.body.exec()
            }
        }
    }

    code() {
        const clause1 = this.clauses[0].code()
        let result = `if (${clause1.statement}) { ${clause1.body} }`
        for (let clause of this.clauses.slice(1)) {
            let cl = clause.code()
            if (clause.statement == null) {
                result += `else {${cl.body}}`
            } else {
                result += `else if (${cl.statement}) {${cl.body}}`
            }
        }
        return result
    }
}

export class FunctionDefinitionStatement extends CompoundStatement {
    private args: Token[]
    name: string
    scope: Scope

    constructor(name: string, args: Token[], body: StatementList, scope: Scope) {
        super(body)
        this.name = name
        this.args = args
    }

    code(): any {
        return `function ${this.name}(${this.args.map(it => it.value).join(',')}){${this.body.code()}}`
    }
}

export class ReturnStatement extends CompoundStatement {

    constructor(value: Expression) {
        super(value)
    }

    code(): any {
        if (this.body.body instanceof SequenceExpression) {
            return `return [${this.body.code()}];`
        } else {
            return `return ${this.body.code()};`
        }
    }
}

export class PrintStatement extends CompoundStatement {
    constructor(value: ExpressionStatement) {
        super(value)
    }

    exec() {
        return this.body.exec()
    }

    code() {
        return `console.log(${this.body.code()})`
    }
}

export class LengthStatement extends CompoundStatement {
    constructor(value: ExpressionStatement) {
        super(value)
    }

    exec() {
        return this.body.exec()
    }

    code() {
        return `${this.body.code()}.length`
    }
}

export class StatementList extends Statement implements Executable {
    expressions: Statement[]

    constructor() {
        super()
        this.expressions = []
    }

    public push(expressionStatement: Statement) {
        this.expressions.push(expressionStatement)
    }

    public exec() {
        return this.expressions.map(expression => expression.exec())
    }

    public code() {
        return this.expressions.map((it) => it.code()).join(';')
    }
}
