var traverse = module.exports = function(statement, func) {
  switch (statement.type) {
    case 'BlockStatement':
    case 'Program':
      for (var i = 0; i < statement.body.length; i++) {
        statement.body[i] = traverse(statement.body[i], func);
      }
      break;
    case 'ExpressionStatement':
      var expression = statement.expression;
      if (expression.type === 'CallExpression') {
        if (expression.callee.type === 'FunctionExpression') {
          expression.callee.body = traverse(expression.callee.body, func);
        }
        expression.arguments.forEach(function (argument, i) {
          if (argument.type === 'FunctionExpression') {
            expression.arguments[i].body = traverse(argument.body, func);
          }
        });
      }
      break;
    case 'IfStatement':
      statement.consequent = traverse(statement.consequent, func);
      if (statement.alternate !== null) {
        statement.alternate = traverse(statement.alternate, func);
      }
      break;
    case 'WhileStatement':
      statement.body = traverse(statement.body, func);
      break;
    case 'ForStatement':
      statement.body = traverse(statement.body, func);
      break;
    case 'SwitchStatement':
      if (statement.cases) {
        for (var i = 0; i < statement.cases.length; i++) {
          statement.cases[i] = traverse(statement.cases[i], func);
        }
      }
      break;
    case 'SwitchCase':
      for (var i = 0; i < statement.consequent.length; i++) {
        statement.consequent[i] = traverse(statement.consequent[i], func);
      }
      break;
  }
  statement = func(statement);
  return statement;
};