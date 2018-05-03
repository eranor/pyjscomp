"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const ast_1 = require("./ast");
/**
 * Created by Ákos on 2017. 05. 13.
 */
exports.EOF = '\0';
exports.EOL_LF = '\n';
exports.EOL_CR = '\r';
exports.TAB = '\t';
exports.WHITESPACE = ' ';
exports.WHITESPACE_CHARS = new utils_1.Dictionary([
    { key: 'SPACE', value: [exports.WHITESPACE] },
    { key: 'TAB', value: [exports.TAB] },
    { key: 'NEWLINE', value: [exports.EOL_CR, exports.EOL_LF] }
]);
exports.SYMBOL_STRING_LITERAL_1 = '\'';
exports.SYMBOL_STRING_LITERAL_2 = '"';
exports.SYMBOL_COMMA_DELIMIER = ',';
exports.SYMBOL_END_OF_DEFINITION = ':';
exports.SYMBOL_PERIOD = '.';
exports.SYMBOL_OXFORD_COMMA = ';';
exports.SYMBOL_AT = '@';
exports.SYMBOL_EQUALS = '=';
exports.SYMBOL_ARROW = '->';
exports.KEYWORD_NONE = 'None';
exports.KEYWORD_FALSE = 'False';
exports.KEYWORD_TRUE = 'True';
exports.KEYWORD_DEF = 'def';
exports.KEYWORD_FOR = 'for';
exports.KEYWORD_WHILE = 'while';
exports.KEYWORD_IF = 'if';
exports.KEYWORD_ELIF = 'elif';
exports.KEYWORD_ELSE = 'else';
exports.KEYWORD_RETURN = 'return';
exports.KEYWORD_LEN = 'len';
exports.KEYWORD_SQUAREROOT = 'sqrt';
exports.KEYWORD_PRINT = 'print';
exports.KEYWORD_INPUT = 'input';
exports.SCIENTIFIC_NOTATION_CHARACTER = 'e';
exports.OPERATOR_POWER = '^';
exports.OPERATOR_DIVISION = '/';
exports.OPERATOR_MULTIPLY = '*';
exports.OPERATOR_SUBRTACT = '-';
exports.OPERATOR_MODULO = '%';
exports.OPERATOR_ADD = '+';
exports.OPERATOR_LESSER = '<';
exports.OPERATOR_GREATER = '>';
exports.OPERATOR_NOT = '!';
exports.OPERATOR_EQUALS = '=';
exports.OPERATOR_NEGATE = 'not';
exports.OPERATOR_AND = 'and';
exports.OPERATOR_OR = 'or';
exports.OPERATOR_IN = 'in';
exports.SQUARE_BRACKET_RIGHT = ']';
exports.SQUARE_BRACKET_LEFT = '[';
exports.CURLY_BRACKET_RIGHT = '}';
exports.CURLY_BRACKET_LEFT = '{';
exports.PARENTHESES_RIGHT = ')';
exports.PARENTHESES_LEFT = '(';
exports.COMMENT_TOKEN_SINGLE = '#';
exports.COMMENT_TOKEN_BLOCK_LEFT = '/#';
exports.COMMENT_TOKEN_BLOCK_RIGHT = '#/';
exports.COMMENT_TOKENS = [exports.COMMENT_TOKEN_SINGLE, exports.COMMENT_TOKEN_BLOCK_LEFT, exports.COMMENT_TOKEN_BLOCK_RIGHT];
exports.action_table = {};
exports.action_table[utils_1.hash(exports.KEYWORD_DEF)] = ast_1.FunctionDefinitionStatement;
exports.action_table[utils_1.hash(exports.KEYWORD_FOR)] = ast_1.ForLoopStatement;
exports.action_table[utils_1.hash(exports.KEYWORD_WHILE)] = ast_1.WhileLoopStatement;
exports.action_table[utils_1.hash(exports.KEYWORD_IF)] = ast_1.IfStatement;
exports.action_table[utils_1.hash(exports.KEYWORD_PRINT)] = ast_1.PrintStatement;
exports.action_table[utils_1.hash(exports.KEYWORD_LEN)] = ast_1.LengthStatement;
//# sourceMappingURL=constants.js.map