import {Rule} from './rule'
import {CompilationError} from './errors'
import {uuidV4} from './utils'

export class Reference {
    private readonly _id: string
    private readonly _name: string
    private readonly _type: string
    private readonly _declared?: boolean

    constructor(name: string, type: string, declared: boolean = true) {
        this._id = uuidV4()
        this._name = name
        this._type = type
        this._declared = declared
    }

    get id(): string {
        return this._id
    }

    get name(): string {
        return this._name
    }

    get type(): string {
        return this._type
    }

    get declared(): boolean {
        return this._declared
    }
}

export class Scope {
    private readonly parent: Scope
    private rules: Rule[]
    variables: Reference[]

    constructor(rules: Rule[], parent?: Scope) {
        this.rules = rules
        this.parent = parent
        this.variables = []
    }

    variableInCurrent(name: string) {
        return !!this.variables.find(it => it.name === name)
    }

    getVariable(name) {
        if (typeof this.parent === 'undefined') {
            return this.variables.find(it => it.name === name)
        }
        return this.parent.getVariable(name)
    }

    variableInParentTree(name: string) {
        if (typeof this.parent === 'undefined') {
            return this.variableInCurrent(name)
        }
        return this.variableInCurrent(name) || this.parent.variableInParentTree(name)
    }

    isRoot() {
        return this.parent === null
    }

    push(...definition: Reference[]) {
        let rule = this.rules.find(rule => rule.getName() === 'BlacklistVariable')
        if (rule) {
            for (let {name, type} of definition) {
                if (rule.getValues().indexOf(name) !== -1) {
                    throw new CompilationError('Variable name is blacklisted:', name)
                }
            }
        }
        this.variables.push(...definition)
    }
}
