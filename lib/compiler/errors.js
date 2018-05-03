"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndentationError extends Error {
    constructor(position, lineCount, recieved) {
        super(`Indentation error at ${position} on line ${lineCount}. Got ${recieved}`);
        Object.setPrototypeOf(this, IndentationError.prototype);
    }
}
exports.IndentationError = IndentationError;
class CompilationError extends Error {
    constructor(reason, token) {
        super(`CompilationError: ${reason} '${token}'`);
        Object.setPrototypeOf(this, CompilationError.prototype);
    }
}
exports.CompilationError = CompilationError;
class SyntaxError extends Error {
    constructor(reason, token) {
        super(`SyntaxError: ${reason}`);
        console.log(token);
        Object.setPrototypeOf(this, SyntaxError.prototype);
    }
}
exports.SyntaxError = SyntaxError;
class ZeroDivisionError extends Error {
    constructor() {
        super(`ZeroDivisionError: division by zero'`);
        Object.setPrototypeOf(this, ZeroDivisionError.prototype);
    }
}
exports.ZeroDivisionError = ZeroDivisionError;
class UnknownTokenError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, UnknownTokenError.prototype);
    }
}
exports.UnknownTokenError = UnknownTokenError;
class NotImplementedError extends Error {
    constructor(message = 'functionality not yet implemented') {
        super(`NotImplementedError: ${message}`);
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}
exports.NotImplementedError = NotImplementedError;
class NameError extends Error {
    constructor(name) {
        super(`NameError: variable or function with name '${name}' is not defined`);
        Object.setPrototypeOf(this, NameError.prototype);
    }
}
exports.NameError = NameError;
//# sourceMappingURL=errors.js.map