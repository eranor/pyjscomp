"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class Scope {
    constructor(rules, parent) {
        this.rules = rules;
        this.parent = parent;
        this.variables = [];
    }
    variableInCurrent(name) {
        return !!this.variables.find(it => it.name === name);
    }
    variableInParentTree(name) {
        if (typeof this.parent === 'undefined') {
            return this.variableInCurrent(name);
        }
        return this.variableInCurrent(name) || this.parent.variableInParentTree(name);
    }
    isRoot() {
        return this.parent === null;
    }
    push(...definition) {
        let rule = this.rules.find(rule => rule.getName() === 'BlacklistVariable');
        if (rule) {
            for (let { name, type } of definition) {
                if (rule.getValues().indexOf(name) !== -1) {
                    throw new errors_1.CompilationError('Variable name is blacklisted:', name);
                }
            }
        }
        this.variables.push(...definition);
    }
}
exports.Scope = Scope;
//# sourceMappingURL=context.js.map