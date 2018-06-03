///<reference path="../src/tokens.ts"/>
import {suite, test} from 'mocha-typescript'
import {expect, use} from 'chai'
import {BracketSymbol} from '../src/tokens'
import * as fs from 'fs'
import {createTree} from '../src/misc'
import {UnknownTokenError} from '../src/errors'
import Lexer from '../src/lexer'
import {Compiler} from '../src'

const type = require('type-detect')

const forEach = require('mocha-each')
import chaiExclude = require('chai-exclude')
import assertArrays = require('chai-arrays')

use(chaiExclude)
use(assertArrays)


const readCodeFromFile = (filePath: any): string => {
    return fs.readFileSync(filePath, 'utf8')
}

@suite
class LexerTest {
    private lexer: Lexer

    @test 'indentation'() {
        const testString =
            `x = 1
if x > 0:
    print('Hello World')
`
        const lexer = new Lexer(testString, true)
        console.log(lexer.tokens.map(it => `${it.name === '' ? 'Token' : it.name}: ${it.value}`).join('\n'))
    }

    @test 'indentation3'() {
        const testString =
            `def x(a):    
    if a > 5:
        return a
    else:
        return a + x(a + 1)
`
        const lexer = new Lexer(testString, true)
        console.log(lexer.tokens.map(it => `${it.name === '' ? 'Token' : it.name}: ${it.value}`).join('\n'))
    }

    @test 'indentation2'() {
        const code =
            `def fact(num):
    factorial = 1
    while num >= 1:
        factorial = factorial * num
        num = num - 1
    return num
print("The factorial of",7,"is",fact(7))
`
        const lexer = new Lexer(code, true)
        console.log(lexer.tokens.map(it => `${it.name === '' ? 'Token' : it.name}: ${it.value}`).join('\n'))
    }

    @test 'indentation4'() {
        const code =
            `def factorial(n):
    if n == 0:
       return 1
    else:
        return n * factorial(n-1)

print("The factorial of",7,"is",factorial(7))
`
        const lexer = new Lexer(code, true)
        console.log(lexer.tokens.filter(it => ['INDENT', 'DEDENT', 'NEWLINE'].indexOf(it.value) !== -1).map(it => `${it.name === '' ? 'Token' : it.name}: ${it.value}`).join('\n'))
    }


    /*
        @test matchTokens() {
            var testString = `
    x = 1
    if x = 1:
        print('hello')

            `
            this.lexer = new Lexer(testString, true)
            const expectedTokens = [
                new Identifier('','x',''),
                OperatorSymbol.matchToken('='),
                new NumberLiteral('1', 'integer'),
                NEWLINE,
                Keyword.matchToken('if'),
                new Token('', 'x', ''),
                OperatorSymbol.matchToken('='),
                new NumberLiteral('1', 'integer'),
                Delimiter.matchToken(':'),
                NEWLINE,
                INDENT,
                Keyword.matchToken('print'),
                BracketSymbol.matchToken('('),
                new StringLiteral('hello'),
                BracketSymbol.matchToken(')'),
                NEWLINE,
                DEDENT,
                ENDOFFILE
            ]
            this.lexer.tokens.map((e, i) => {
                return {a: e, b: expectedTokens[i]}
            }).forEach(({a, b}) => {
                expect(a).to.have.property('name', b.name)
                expect(a).to.have.property('type', b.type)
                expect(a).to.have.property('value', b.value)
            })
        }*/


    @test analyzeFile() {
        this.lexer = new Lexer(readCodeFromFile('./static/test.py'), true)
        console.log(this.lexer.tokens.map(it => `${it.name === '' ? 'Token' : it.name}: ${it.value}`).join('\n'))
    }
}

@suite('for compilation of')
class CompilerTest {
    private compiler: Compiler

    before() {
        this.compiler = new Compiler()
    }

    @test testCompiler1() {
        let compiler = new Compiler()
        compiler.compile('print(1+2)')
        let code = compiler.compile(readCodeFromFile('./static/test.py'))
        console.log(code.code())
        //createTree(code)
    }

    @test 'testCompiler3'() {
        const testString =
            `def x(a):    
    if a > 5:
        return a
    else:
        return a + x(a + 1)
`
        let compiler = this.compiler.compile(testString)
        console.log(compiler.code())
    }

    @test 'addition expression'() {
        expect(this.compiler.compile('1+1').exec()[0]).to.equal(2)
        expect(this.compiler.compile('2+2').exec()[0]).to.equal(4)
        expect(this.compiler.compile('2+2').exec()[0]).to.not.equal(5)
    }

    @test 'negation expression'() {
        expect(this.compiler.compile('-1').exec()[0]).to.equal(-1)
        expect(this.compiler.compile('-(-1)').exec()[0]).to.equal(1)
        expect(this.compiler.compile('-(-(-1))').exec()[0]).to.not.equal(1)
        expect(() => this.compiler.compile('--1')).to.throw(`SyntaxError: Unknown Operator`)
    }

    @test 'subtraction expression'() {
        expect(this.compiler.compile('1-1').exec()[0]).to.equal(0)
        expect(this.compiler.compile('1--1').exec()[0]).to.equal(2)
        expect(this.compiler.compile('1-2').exec()[0]).to.equal(-1)
        expect(this.compiler.compile('2-0').exec()[0]).to.equal(2)
        expect(this.compiler.compile('-2-1').exec()[0]).to.equal(-3)
    }

    @test 'multiplication expression'() {
        expect(this.compiler.compile('1*1').exec()[0]).to.equal(1)
        expect(this.compiler.compile('1*2').exec()[0]).to.equal(2)
        expect(this.compiler.compile('2*2').exec()[0]).to.equal(4)
        expect(this.compiler.compile('-1*1').exec()[0]).to.equal(-1)
        expect(this.compiler.compile('20*20').exec()[0]).to.equal(20 * 20)
        expect(this.compiler.compile('20*0').exec()[0]).to.equal(0)
    }


    @test 'parentheses'() {
        expect(this.compiler.compile('(1+2)*2').exec()[0]).to.equal(6)
        expect(this.compiler.compile('1+2*2').exec()[0]).to.equal(5)
    }

    @test 'mixed expression'() {
        const statementList = this.compiler.compile('1*(1+2)*4')
        expect(statementList.exec()[0]).to.equal(12)
    }

    @test 'functionDefinition'() {
        const code =
            `
a=1
def func(a):
    print(a)
`
        const functionDefinition = this.compiler.compile(code)
        expect(functionDefinition.code()).to.equal('let a = 1;function func(a){console.log(a)}')
    }

    @test 'functionDefinition2'() {
        const code =
            `
a=1
def func():
    print(a)
`
        const functionDefinition = this.compiler.compile(code)
        expect(functionDefinition.code()).to.equal('let a = 1;function func(){console.log(a)}')
    }

    @test 'functionDefinition3'() {
        const code =
            `
def func():
    print(a)
`
        expect(() => this.compiler.compile(code)).to.throw('NameError: variable or function with name \'a\' is not defined')
    }

    @test 'functionCall1'() {
        const code =
            `
def func():
    print(5)
    func()
`
        const functionDefinition = this.compiler.compile(code)
        expect(functionDefinition.code()).to.equal('function func(){console.log(5);func()}')
    }

    /*    @test 'functionCall2'() {
            const code =
                `
    def func(a):
        print(a)

    func(5)
    `
            const functionDefinition = this.compiler.compile(code)
            expect(functionDefinition.code()).to.equal('function func(a){console.log(a)};func(5)}')
        }*/
    @test 'code3'() {
        const code =
            `
# Python program to find the factorial of a number provided by the user.
# change the value for a different result
num = 7
factorial = 1
# check if the number is negative, positive or zero
if num < 0:
    print("Sorry, factorial does not exist for negative numbers")
elif num == 0:
    print("The factorial of 0 is 1")
else:
    i=1
    while i > 1 and i < num + 1:
        factorial = factorial * i
        i = i + 1
print("The factorial of",num,"is",factorial)
`
        const functionDefinition = this.compiler.compile(code)
        console.log(functionDefinition.code())
    }

    @test 'factorialLoop'() {
        const code =
            `def fact(n):
    factorial = 1
    while n >= 1:
        factorial = factorial * n
        n = n - 1
    return factorial
print("The factorial of",7,"is",fact(7))
`
        const functionDefinition = this.compiler.compile(code)
        console.log(functionDefinition.code())
    }

    @test 'factorialRecursive'() {
        const code =
            `def factorial(n):
    if n == 0:
       return 1
    else:
        return n * factorial(n-1)

print("The factorial of",7,"is",factorial(7))
`
        const functionDefinition = this.compiler.compile(code)
        console.log(functionDefinition.code())
    }

    @test 'whileLoop1'() {
        const code =
            `
i = 0
while(i < 10):
    print(i)
    i = i + 1
`
        const whileLoop = this.compiler.compile(code)
        expect(whileLoop.code()).to.equal('let i = 0;while ((i < 10)){console.log(i);i = i + 1}')
    }

    @test 'forLoop1'() {
        const code =
            `
for i in range(5):
    print(i)
`
        const forLoop = this.compiler.compile(code)
        expect(forLoop.code()).to.equal('for (let i=0;(function(n,r,t){return 0<=t?n<r:r<=n})(i,5,1);i+=1){console.log(i)}')
    }

    @test 'forLoop2'() {
        const code =
            `
for i in range(1,5):
    print(i)
`
        const forLoop = this.compiler.compile(code)
        expect(forLoop.code()).to.equal('for (let i=1;(function(n,r,t){return 0<=t?n<r:r<=n})(i,5,1);i+=1){console.log(i)}')
    }

    @test 'forLoop3'() {
        const code =
            `
for i in range(5,1,-2):
    print(i)
`
        const forLoop = this.compiler.compile(code)
        expect(forLoop.code()).to.equal('for (let i=5;(function(n,r,t){return 0<=t?n<r:r<=n})(i,1,-2);i+=-2){console.log(i)}')
    }

    @test 'forLoop4'() {
        const code =
            `
def test(x):
    return x+1

for i in range(test(1),5):
    print(test(i-1))
`
        const forLoop = this.compiler.compile(code)
        expect(forLoop.code()).to.equal('function test(x){return x + 1;};for (let i=test(1);(function(n,r,t){return 0<=t?n<r:r<=n})(i,5,1);i+=1){console.log(test(i - 1))}')
    }


    @test 'returnStatement'() {
        const code =
            `
def func():
    print(5)
    return func()
`
        const functionDefinition = this.compiler.compile(code)
        expect(functionDefinition.code()).to.equal('function func(){console.log(5);return func();}')
    }

    @test 'generated JavaScript 1'() {
        const statementList = this.compiler.compile('1*(1+2)*4')
        expect(statementList.code()).to.equal('1 * (1 + 2) * 4')
    }

    @test 'generated JavaScript 2'() {
        const statementList = this.compiler.compile('-(1-(1*(1+2)*4)/(1+1)/2)')
        expect(statementList.exec()[0]).to.equal(2)
        expect(statementList.code()).to.equal('-(1 - (1 * (1 + 2) * 4) / (1 + 1) / 2)')
    }

    @test 'decimal numbers'() {
        const statementList = this.compiler.compile('1/2')
        expect(statementList.exec()[0]).to.equal(0.5)
    }

    @test 'division expression'() {
        expect(this.compiler.compile('1/1').exec()[0]).to.equal(1)
        expect(this.compiler.compile('2+2/2').exec()[0]).to.equal(3)
        expect(this.compiler.compile('2/-2').exec()[0]).to.equal(-1)
    }

    @test 'power expression'() {
        expect(this.compiler.compile('1+1').exec()[0]).to.equal(2)
        expect(this.compiler.compile('2+2').exec()[0]).to.equal(4)
        expect(this.compiler.compile('2+2').exec()[0]).to.not.equal(5)
    }

    @test 'invalid syntax'() {
        expect(() => this.compiler.compile('1++1').exec()).to.throw('SyntaxError: invalid syntax')
        expect(() => this.compiler.compile('1--1').exec()).to.not.throw('SyntaxError: invalid syntax')
        expect(() => this.compiler.compile('1+1').exec()).to.not.throw('SyntaxError: invalid syntax')

    }

    @test 'AST tree graph generation'() {
        let code = this.compiler.compile('1*(1+2)*4')
        console.log(createTree(code))
    }
}

const validBracketTokens = [
    {value: '(', type: 'round', side: 'open'},
    {value: ')', type: 'round', side: 'close'},
    {value: '[', type: 'square', side: 'open'},
    {value: ']', type: 'square', side: 'close'},
    {value: '{', type: 'curly', side: 'open'},
    {value: '}', type: 'curly', side: 'close'}
]


describe('For each character test', function () {
    ['(', '[', ']', '{', '}', ')'].forEach((char) => {
        it(`if '${char}' is a valid bracket token`, () => {
            expect(() => BracketSymbol.matchToken(char)).to.not.throw()
            const target = BracketSymbol.matchToken(char)
            expect(target).to.have.property('name')
            expect(target).to.have.property('side')
            expect(target).to.have.property('value', char)
        })
    });
    [' ', 'a', '', '    '].forEach((char) => {
        it(`if '${char}' throws an error`, () => {
            expect(() => BracketSymbol.matchToken(char)).to.throw(UnknownTokenError)
        })
    })

})

