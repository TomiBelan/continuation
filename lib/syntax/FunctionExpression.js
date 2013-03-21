var FunctionExpression = module.exports = function (id, params, body, loc, range, original) {
  this.type = 'FunctionExpression';
  this.id = id;
  this.params = params;
  this.body = body;
  this.loc = loc;
  this.range = range;
  this.isContinuation = !original;
};

FunctionExpression.prototype.normalize = function () {
  var helpers = require('../helpers');
  var dec = helpers.extractVariableDeclarations(this.body);
  if (dec.declarations.length > 0) {
    this.body.body.unshift(dec);
  }
  return this;
};

FunctionExpression.prototype.transform = function (place) {
  this.body.transform();   // ignore new place
  return place;
};

FunctionExpression.prototype.fixup = function () {
  var traverse = require('../traverse');
  var helpers = require('../helpers');
  var VariableDeclaration = require('./VariableDeclaration');
  var VariableDeclarator = require('./VariableDeclarator');
  var Identifier = require('./Identifier');
  var ThisExpression = require('./ThisExpression');

  if (this.isContinuation) {
    // continuations aren't called with proper "this"
    // so we replace "this" with "_$this" inside them
    traverse(this.body, {currentScope: true}, function (node) {
      if (node.type == 'ThisExpression') return new Identifier(helpers.thisName);
      return node;
    });
  }
  else {
    // if this is an original function which contains "_$this" in one of its
    // continuations, we add "var _$this = this"
    var needThis = false;
    traverse(this.body, {currentScope: true}, function (node) {
      if (node.type == 'Identifier' && node.name == helpers.thisName) needThis = true;
      return node;
    });
    if (needThis) {
      if (!(this.body.body[0] && this.body.body[0].type == 'VariableDeclaration' && this.body.body[0].kind == 'var')) {
        this.body.body.unshift(new VariableDeclaration([]));
      }
      this.body.body[0].declarations.unshift(new VariableDeclarator(
        new Identifier(helpers.thisName), new ThisExpression()));
    }
  }

  return this;
};
