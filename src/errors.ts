import {IToken} from './tokens'

export class IndentationError extends Error {
    constructor(position, lineCount, recieved) {
        super(`Indentation error at ${position} on line ${lineCount}. Got ${recieved}`)
        Object.setPrototypeOf(this, IndentationError.prototype)
    }
}

export class CompilationError extends Error {
    constructor(reason?: string, token?: IToken | string) {
        super(`CompilationError: ${reason} '${token}'`)
        Object.setPrototypeOf(this, CompilationError.prototype)
    }
}

export class SyntaxError extends Error {
    constructor(reason?: string, token?: IToken | string) {
        super(`SyntaxError: ${reason} at ${token}`)
        Object.setPrototypeOf(this, SyntaxError.prototype)
    }
}

export class ZeroDivisionError extends Error {
    constructor() {
        super(`ZeroDivisionError: division by zero'`)
        Object.setPrototypeOf(this, ZeroDivisionError.prototype)
    }
}

export class UnknownTokenError extends Error {
    constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, UnknownTokenError.prototype)
    }
}

export class NotImplementedError extends Error {
    constructor(message: string = 'functionality not yet implemented') {
        super(`NotImplementedError: ${message}`)
        Object.setPrototypeOf(this, NotImplementedError.prototype)
    }
}

export class NameError extends Error {
    constructor(name: string) {
        super(`NameError: variable or function with name '${name}' is not defined`)
        Object.setPrototypeOf(this, NameError.prototype)
    }
}
