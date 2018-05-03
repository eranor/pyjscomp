"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Ákos on 2017. 04. 27.
 */
const lodash_1 = require("lodash");
class Dictionary {
    constructor(init) {
        this._keys = [];
        this._values = [];
        for (var x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value;
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }
    }
    add(key, value) {
        this[key] = value;
        this._keys.push(key);
        this._values.push(value);
    }
    remove(key) {
        const index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        delete this[key];
    }
    keys() {
        return this._keys;
    }
    values() {
        return this._values;
    }
    containsKey(key) {
        return typeof this[key] !== 'undefined';
    }
    containsValue(value) {
        return this._values.indexOf(value) > -1;
    }
    toLookup() {
        return this;
    }
}
exports.Dictionary = Dictionary;
class Stack {
    constructor() {
        this._store = [];
    }
    push(val) {
        this._store.push(val);
    }
    pop() {
        return this._store.pop();
    }
    top() {
        return lodash_1.last(this._store);
    }
}
exports.Stack = Stack;
function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}
exports.entries = entries;
function hash(value) {
    return (value.charCodeAt(0) * 8 + value.charCodeAt(1)) % 16;
}
exports.hash = hash;
//# sourceMappingURL=utils.js.map