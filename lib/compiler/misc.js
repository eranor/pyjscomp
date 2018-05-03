"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const object_hash_1 = require("object-hash");
function createTree(list) {
    let nodes = [];
    let edges = [];
    function traverseTree(list, level = 0) {
        nodes.push({ id: object_hash_1.MD5(list), label: `${list.constructor.name}`, level, shape: 'box' });
        if (list instanceof ast_1.Atom) {
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.value) });
            nodes[nodes.length - 1] = Object.assign({}, nodes[nodes.length - 1], { font: { multi: 'md', face: 'georgia' }, label: `*${list.value.constructor.name}*\n _value_:${list.value}` });
        }
        else if (list instanceof ast_1.StatementList) {
            list.expressions.forEach((it) => {
                edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(it) });
                traverseTree(it, level + 1);
            });
        }
        else if (list instanceof ast_1.IfStatement) {
            list.clauses.forEach((it) => {
                edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(it) });
                if (it.statement != null)
                    traverseTree(it.statement, level + 1);
                traverseTree(it.body, level + 1);
            });
        }
        else if (list instanceof ast_1.BinaryExpression) {
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.left) });
            traverseTree(list.left, level + 1);
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.right) });
            traverseTree(list.right, level + 1);
        }
        else if (list instanceof ast_1.Statement) {
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.body) });
            traverseTree(list.body, level + 1);
        }
        else if (list instanceof ast_1.Enclosure) {
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.value) });
            traverseTree(list.value, level + 1);
        }
        else if (list instanceof ast_1.AccessExpression) {
            edges.push({ from: object_hash_1.MD5(list), to: object_hash_1.MD5(list.left) });
            traverseTree(list.left, level + 1);
        }
    }
    traverseTree(list);
    console.log(edges);
    console.log(nodes);
}
exports.createTree = createTree;
//# sourceMappingURL=misc.js.map