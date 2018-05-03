import {Rule} from './rule'
import {CompilationError} from './errors'

export class Scope {
    private readonly parent: Scope
    private rules: Rule[]
    variables: { name: string, type: string }[]

    constructor(rules: Rule[], parent?: Scope) {
        this.rules = rules
        this.parent = parent
        this.variables = []
    }

    variableInCurrent(name: string) {
        return !!this.variables.find(it => it.name === name)
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

    push(...definition: { name: string, type: string }[]) {
        let rule = this.rules.find(rule => rule.getName() === 'BlacklistVariable')
        if (rule) {
            for (let {name, type} of definition){
                if (rule.getValues().indexOf(name) !== -1){
                    throw new CompilationError('Variable name is blacklisted:', name)
                }
            }
        }
        this.variables.push(...definition)
    }
}
