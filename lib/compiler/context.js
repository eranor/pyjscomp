"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const utils_1 = require("./utils");
class Reference {
    constructor(name, type, declared = true) {
        this._id = utils_1.uuidV4();
        this._name = name;
        this._type = type;
        this._declared = declared;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get declared() {
        return this._declared;
    }
}
exports.Reference = Reference;
class Scope {
    constructor(rules, parent) {
        this.rules = rules;
        this.parent = parent;
        this.variables = [];
    }
    variableInCurrent(name) {
        return !!this.variables.find(it => it.name === name);
    }
    getVariable(name) {
        if (typeof this.parent === 'undefined') {
            return this.variables.find(it => it.name === name);
        }
        return this.parent.getVariable(name);
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