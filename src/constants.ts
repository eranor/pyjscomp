import {Dictionary, hash} from './utils'
import {
    LengthStatement} from './ast/statements'
import {
    ForLoopStatement,
    FunctionDefinitionStatement,
    IfStatement,
    PrintStatement,
    WhileLoopStatement
} from './ast/statements'

/**
 * Created by Ákos on 2017. 05. 13.
 */
export const EOF = '\0'
export const EOL_LF = '\n'
export const EOL_CR = '\r'
export const TAB = '\t'
export const WHITESPACE = ' '

export const WHITESPACE_CHARS = new Dictionary([
    {key: 'SPACE', value: [WHITESPACE]},
    {key: 'TAB', value: [TAB]},
    {key: 'NEWLINE', value: [EOL_CR, EOL_LF]}])


export const SYMBOL_STRING_LITERAL_1 = '\''
export const SYMBOL_STRING_LITERAL_2 = '"'
export const SYMBOL_COMMA_DELIMIER = ','
export const SYMBOL_END_OF_DEFINITION = ':'
export const SYMBOL_PERIOD = '.'
export const SYMBOL_OXFORD_COMMA = ';'
export const SYMBOL_AT = '@'
export const SYMBOL_EQUALS = '='
export const SYMBOL_ARROW = '->'

export const KEYWORD_NONE = 'None'
export const KEYWORD_FALSE = 'False'
export const KEYWORD_TRUE = 'True'
export const KEYWORD_DEF = 'def'
export const KEYWORD_FOR = 'for'
export const KEYWORD_WHILE = 'while'
export const KEYWORD_IF = 'if'
export const KEYWORD_ELIF = 'elif'
export const KEYWORD_ELSE = 'else'
export const KEYWORD_RETURN = 'return'

export const KEYWORD_LEN = 'len'
export const KEYWORD_SQUAREROOT = 'sqrt'
export const KEYWORD_PRINT = 'print'
export const KEYWORD_INPUT = 'input'

export const SCIENTIFIC_NOTATION_CHARACTER = 'e'
export const OPERATOR_POWER = '^'
export const OPERATOR_DIVISION = '/'
export const OPERATOR_MULTIPLY = '*'
export const OPERATOR_SUBRTACT = '-'
export const OPERATOR_MODULO = '%'
export const OPERATOR_ADD = '+'
export const OPERATOR_LESSER = '<'
export const OPERATOR_GREATER = '>'
export const OPERATOR_NOT = '!'
export const OPERATOR_EQUALS = '='
export const OPERATOR_NEGATE = 'not'
export const OPERATOR_AND = 'and'
export const OPERATOR_OR = 'or'
export const OPERATOR_IN = 'in'

export const SQUARE_BRACKET_RIGHT = ']'
export const SQUARE_BRACKET_LEFT = '['
export const CURLY_BRACKET_RIGHT = '}'
export const CURLY_BRACKET_LEFT = '{'
export const PARENTHESES_RIGHT = ')'
export const PARENTHESES_LEFT = '('
export const COMMENT_TOKEN_SINGLE = '#'
export const COMMENT_TOKEN_BLOCK_LEFT = '/#'
export const COMMENT_TOKEN_BLOCK_RIGHT = '#/'

export const COMMENT_TOKENS = [COMMENT_TOKEN_SINGLE, COMMENT_TOKEN_BLOCK_LEFT, COMMENT_TOKEN_BLOCK_RIGHT]


export const action_table = {}
action_table[hash(KEYWORD_DEF)] = FunctionDefinitionStatement
action_table[hash(KEYWORD_FOR)] = ForLoopStatement
action_table[hash(KEYWORD_WHILE)] = WhileLoopStatement
action_table[hash(KEYWORD_IF)] = IfStatement
action_table[hash(KEYWORD_PRINT)] = PrintStatement
action_table[hash(KEYWORD_LEN)] = LengthStatement
