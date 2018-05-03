import {
    AccessExpression,
    Atom,
    BinaryExpression,
    Enclosure,
    Expression} from './ast/index'
import {MD5} from 'object-hash'
import {IfStatement, Statement, StatementList} from './ast/statements'

export function createTree(list: StatementList) {
    let nodes = []
    let edges = []

    function traverseTree(list: Statement | Atom | Expression | Enclosure, level: number = 0) {
        nodes.push({id: MD5(list), label: `${list.constructor.name}`, level, shape: 'box'})
        if (list instanceof Atom) {
            edges.push({from: MD5(list), to: MD5(list.value)})
            nodes[nodes.length - 1] = {
                ...nodes[nodes.length - 1],
                font: {multi: 'md', face: 'georgia'},
                label: `*${list.value.constructor.name}*\n _value_:${list.value}`
            }
        } else if (list instanceof StatementList) {
            (list as StatementList).expressions.forEach((it) => {
                edges.push({from: MD5(list), to: MD5(it)})
                traverseTree(it, level + 1)
            })
        } else if (list instanceof IfStatement) {
            (list as IfStatement).clauses.forEach((it) => {
                edges.push({from: MD5(list), to: MD5(it)})
                if (it.statement != null) traverseTree(it.statement, level + 1)
                traverseTree(it.body, level + 1)
            })
        } else if (list instanceof BinaryExpression) {
            edges.push({from: MD5(list), to: MD5(list.left)})
            traverseTree(list.left, level + 1)
            edges.push({from: MD5(list), to: MD5(list.right)})
            traverseTree(list.right, level + 1)
        } else if (list instanceof Statement) {
            edges.push({from: MD5(list), to: MD5(list.body)})
            traverseTree(list.body, level + 1)
        } else if (list instanceof Enclosure) {
            edges.push({from: MD5(list), to: MD5(list.value)})
            traverseTree(list.value, level + 1)
        } else if (list instanceof AccessExpression) {
            edges.push({from: MD5(list), to: MD5(list.left)})
            traverseTree(list.left, level + 1)
        }
    }

    traverseTree(list)
    console.log(edges)
    console.log(nodes)
}
