/**
 * Created by Ákos on 2017. 04. 27.
 */
import {last} from 'lodash'

export interface IDictionary {
    add(key: string, value: any): void;

    remove(key: string): void;

    containsKey(key: string): boolean;

    containsValue(value: any): boolean;

    keys(): string[];

    values(): any[];
}

export class Dictionary {

    _keys: string[] = []
    _values: any[] = []

    constructor(init: { key: string; value: any; }[]) {

        for (var x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value
            this._keys.push(init[x].key)
            this._values.push(init[x].value)
        }
    }

    add(key: string, value: any) {
        this[key] = value
        this._keys.push(key)
        this._values.push(value)
    }

    remove(key: string) {
        const index = this._keys.indexOf(key, 0)
        this._keys.splice(index, 1)
        this._values.splice(index, 1)

        delete this[key]
    }

    keys(): string[] {
        return this._keys
    }

    values(): any[] {
        return this._values
    }

    containsKey(key: string) {
        return typeof this[key] !== 'undefined'
    }

    containsValue(value: any) {
        return this._values.indexOf(value) > -1
    }

    toLookup(): IDictionary {
        return this
    }
}

export class Stack<T> {
    _store: T[] = []

    push(val: T) {
        this._store.push(val)
    }

    pop(): T | undefined {
        return this._store.pop()
    }

    top() {
        return last(this._store)
    }
}

export function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]]
    }
}

export function hash(value: string) {
    return (value.charCodeAt(0) * 8 + value.charCodeAt(1)) % 16
}

export function uuidV4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
