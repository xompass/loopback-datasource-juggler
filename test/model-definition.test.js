// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-datasource-juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// This test written in mocha+should.js
'use strict';
var should = require('./init.js');
var assert = require('assert');

var jdb = require('../');
var ModelBuilder = jdb.ModelBuilder;
var DataSource = jdb.DataSource;
var Memory = require('../lib/connectors/memory');

var ModelDefinition = require('../lib/model-definition');

describe('ModelDefinition class', function() {
  var memory;
  beforeEach(function() {
    memory = new DataSource({connector: Memory});
  });

  it('should be able to define plain models', function(done) {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      name: 'string',
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: 'number',
    });

    User.build();
    assert.equal(User.properties.name.type, String);
    assert.equal(User.properties.bio.type, ModelBuilder.Text);
    assert.equal(User.properties.approved.type, Boolean);
    assert.equal(User.properties.joinedAt.type, Date);
    assert.equal(User.properties.age.type, Number);

    var json = User.toJSON();
    assert.equal(json.name, 'User');
    assert.equal(json.properties.name.type, 'String');
    assert.equal(json.properties.bio.type, 'Text');
    assert.equal(json.properties.approved.type, 'Boolean');
    assert.equal(json.properties.joinedAt.type, 'Date');
    assert.equal(json.properties.age.type, 'Number');

    assert.deepEqual(User.toJSON(), json);

    done();
  });

  it('should be able to define additional properties', function(done) {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      name: 'string',
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: 'number',
    });

    User.build();

    var json = User.toJSON();

    User.defineProperty('id', {type: 'number', id: true});
    assert.equal(User.properties.name.type, String);
    assert.equal(User.properties.bio.type, ModelBuilder.Text);
    assert.equal(User.properties.approved.type, Boolean);
    assert.equal(User.properties.joinedAt.type, Date);
    assert.equal(User.properties.age.type, Number);

    assert.equal(User.properties.id.type, Number);

    json = User.toJSON();
    assert.deepEqual(json.properties.id, {type: 'Number', id: true});

    done();
  });

  it('should be able to define nesting models', function(done) {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      name: String,
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: Number,
      address: {
        street: String,
        city: String,
        zipCode: String,
        state: String,
      },
    });

    User.build();
    assert.equal(User.properties.name.type, String);
    assert.equal(User.properties.bio.type, ModelBuilder.Text);
    assert.equal(User.properties.approved.type, Boolean);
    assert.equal(User.properties.joinedAt.type, Date);
    assert.equal(User.properties.age.type, Number);
    assert.equal(typeof User.properties.address.type, 'function');

    var json = User.toJSON();
    assert.equal(json.name, 'User');
    assert.equal(json.properties.name.type, 'String');
    assert.equal(json.properties.bio.type, 'Text');
    assert.equal(json.properties.approved.type, 'Boolean');
    assert.equal(json.properties.joinedAt.type, 'Date');
    assert.equal(json.properties.age.type, 'Number');

    assert.deepEqual(json.properties.address.type, {street: {type: 'String'},
      city: {type: 'String'},
      zipCode: {type: 'String'},
      state: {type: 'String'}});

    done();
  });

  it('should be able to define referencing models', function(done) {
    var modelBuilder = new ModelBuilder();

    var Address = modelBuilder.define('Address', {
      street: String,
      city: String,
      zipCode: String,
      state: String,
    });
    var User = new ModelDefinition(modelBuilder, 'User', {
      name: String,
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: Number,
      address: Address,

    });

    User.build();
    assert.equal(User.properties.name.type, String);
    assert.equal(User.properties.bio.type, ModelBuilder.Text);
    assert.equal(User.properties.approved.type, Boolean);
    assert.equal(User.properties.joinedAt.type, Date);
    assert.equal(User.properties.age.type, Number);
    assert.equal(User.properties.address.type, Address);

    var json = User.toJSON();
    assert.equal(json.name, 'User');
    assert.equal(json.properties.name.type, 'String');
    assert.equal(json.properties.bio.type, 'Text');
    assert.equal(json.properties.approved.type, 'Boolean');
    assert.equal(json.properties.joinedAt.type, 'Date');
    assert.equal(json.properties.age.type, 'Number');

    assert.equal(json.properties.address.type, 'Address');

    done();
  });

  it('should be able to define referencing models by name', function(done) {
    var modelBuilder = new ModelBuilder();

    var Address = modelBuilder.define('Address', {
      street: String,
      city: String,
      zipCode: String,
      state: String,
    });
    var User = new ModelDefinition(modelBuilder, 'User', {
      name: String,
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: Number,
      address: 'Address',

    });

    User.build();
    assert.equal(User.properties.name.type, String);
    assert.equal(User.properties.bio.type, ModelBuilder.Text);
    assert.equal(User.properties.approved.type, Boolean);
    assert.equal(User.properties.joinedAt.type, Date);
    assert.equal(User.properties.age.type, Number);
    assert.equal(User.properties.address.type, Address);

    var json = User.toJSON();
    assert.equal(json.name, 'User');
    assert.equal(json.properties.name.type, 'String');
    assert.equal(json.properties.bio.type, 'Text');
    assert.equal(json.properties.approved.type, 'Boolean');
    assert.equal(json.properties.joinedAt.type, 'Date');
    assert.equal(json.properties.age.type, 'Number');

    assert.equal(json.properties.address.type, 'Address');

    done();
  });

  it('should report correct id names', function(done) {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      userId: {type: String, id: true},
      name: 'string',
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: 'number',
    });

    assert.equal(User.idName(), 'userId');
    assert.deepEqual(User.idNames(), ['userId']);
    done();
  });

  it('should sort id properties by its index', function() {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      userId: {type: String, id: 2},
      userType: {type: String, id: 1},
      name: 'string',
      bio: ModelBuilder.Text,
      approved: Boolean,
      joinedAt: Date,
      age: 'number',
    });

    var ids = User.ids();
    assert.ok(Array.isArray(ids));
    assert.equal(ids.length, 2);
    assert.equal(ids[0].id, 1);
    assert.equal(ids[0].name, 'userType');
    assert.equal(ids[1].id, 2);
    assert.equal(ids[1].name, 'userId');
  });

  it('should report correct table/column names', function(done) {
    var modelBuilder = new ModelBuilder();

    var User = new ModelDefinition(modelBuilder, 'User', {
      userId: {type: String, id: true, oracle: {column: 'ID'}},
      name: 'string',
    }, {oracle: {table: 'USER'}});

    assert.equal(User.tableName('oracle'), 'USER');
    assert.equal(User.tableName('mysql'), 'User');
    assert.equal(User.columnName('oracle', 'userId'), 'ID');
    assert.equal(User.columnName('mysql', 'userId'), 'userId');
    done();
  });

  it('should serialize protected properties into JSON', function() {
    var ProtectedModel = memory.createModel('protected', {}, {
      protected: ['protectedProperty'],
    });
    var pm = new ProtectedModel({
      id: 1, foo: 'bar', protectedProperty: 'protected',
    });
    var serialized = pm.toJSON();
    assert.deepEqual(serialized, {
      id: 1, foo: 'bar', protectedProperty: 'protected',
    });
  });

  it('should not serialize protected properties of nested models into JSON', function(done) {
    var Parent = memory.createModel('parent');
    var Child = memory.createModel('child', {}, {protected: ['protectedProperty']});
    Parent.hasMany(Child);
    Parent.create({
      name: 'parent',
    }, function(err, parent) {
      if (err) return done(err);
      parent.children.create({
        name: 'child',
        protectedProperty: 'protectedValue',
      }, function(err, child) {
        if (err) return done(err);
        Parent.find({include: 'children'}, function(err, parents) {
          if (err) return done(err);
          var serialized = parents[0].toJSON();
          var child = serialized.children[0];
          assert.equal(child.name, 'child');
          assert.notEqual(child.protectedProperty, 'protectedValue');
          done();
        });
      });
    });
  });

  it('should not serialize hidden properties into JSON', function() {
    var HiddenModel = memory.createModel('hidden', {}, {
      hidden: ['secret'],
    });
    var hm = new HiddenModel({
      id: 1,
      foo: 'bar',
      secret: 'secret',
    });
    var serialized = hm.toJSON();
    assert.deepEqual(serialized, {
      id: 1,
      foo: 'bar',
    });
  });

  it('should not serialize hidden properties of nested models into JSON', function(done) {
    var Parent = memory.createModel('parent');
    var Child = memory.createModel('child', {}, {hidden: ['secret']});
    Parent.hasMany(Child);
    Parent.create({
      name: 'parent',
    }, function(err, parent) {
      if (err) return done(err);
      parent.children.create({
        name: 'child',
        secret: 'secret',
      }, function(err, child) {
        if (err) return done(err);
        Parent.find({include: 'children'}, function(err, parents) {
          if (err) return done(err);
          var serialized = parents[0].toJSON();
          var child = serialized.children[0];
          assert.equal(child.name, 'child');
          assert.notEqual(child.secret, 'secret');
          done();
        });
      });
    });
  });

  describe('hidden properties', function() {
    var Child;
    beforeEach(givenChildren);

    it('should be removed if used in where', function() {
      return Child.find({
        where: {secret: 'guess'},
      }).then(assertHiddenPropertyIsIgnored);
    });

    it('should be removed if used in where.and', function() {
      return Child.find({
        where: {and: [{secret: 'guess'}]},
      }).then(assertHiddenPropertyIsIgnored);
    });

    /**
     * Create two children with a hidden property, one with a matching
     * value, the other with a non-matching value
     */
    function givenChildren() {
      Child = memory.createModel('child', {}, {hidden: ['secret']});
      return Child.create([{
        name: 'childA',
        secret: 'secret',
      }, {
        name: 'childB',
        secret: 'guess',
      }]);
    }

    function assertHiddenPropertyIsIgnored(children) {
      // All children are found whether the `secret` condition matches or not
      // as the condition is removed because it's hidden
      children.length.should.equal(2);
    }
  });

  function assertParentIncludeChildren(parents) {
    parents[0].toJSON().children.length.should.equal(1);
  }

  describe('protected properties', function() {
    var Parent;
    var Child;
    beforeEach(givenParentAndChild);

    it('should be removed if used in include scope', function() {
      Parent.find({
        include: {
          relation: 'children',
          scope: {
            where: {
              secret: 'x',
            },
          },
        },
      }).then(assertParentIncludeChildren);
    });

    it('should be rejected if used in include scope.where.and', function() {
      return Parent.find({
        include: {
          relation: 'children',
          scope: {
            where: {
              and: [{secret: 'x'}],
            },
          },
        },
      }).then(assertParentIncludeChildren);
    });

    it('should be removed if a hidden property is used in include scope', function() {
      return Parent.find({
        include: {
          relation: 'children',
          scope: {
            where: {
              secret: 'x',
            },
          },
        },
      }).then(assertParentIncludeChildren);
    });

    function givenParentAndChild() {
      Parent = memory.createModel('parent');
      Child = memory.createModel('child', {}, {protected: ['secret']});
      Parent.hasMany(Child);
      return Parent.create({
        name: 'parent',
      }).then(parent => {
        return parent.children.create({
          name: 'child',
          secret: 'secret',
        });
      });
    }
  });

  describe('hidden properties in include', function() {
    var Parent;
    var Child;
    beforeEach(givenParentAndChildWithHiddenProperty);

    it('should be rejected if used in scope', function() {
      return Parent.find({
        include: {
          relation: 'children',
          scope: {
            where: {
              secret: 'x',
            },
          },
        },
      }).then(assertParentIncludeChildren);
    });

    function givenParentAndChildWithHiddenProperty() {
      Parent = memory.createModel('parent');
      Child = memory.createModel('child', {}, {hidden: ['secret']});
      Parent.hasMany(Child);
      return Parent.create({
        name: 'parent',
      }).then(parent => {
        return parent.children.create({
          name: 'child',
          secret: 'secret',
        });
      });
    }
  });

  it('should throw error for property names containing dot', function() {
    (function() { memory.createModel('Dotted', {'dot.name': String}); })
      .should
      .throw(/dot\(s\).*Dotted.*dot\.name/);
  });

  it('should report deprecation warning for property named constructor', function() {
    var message = 'deprecation not reported';
    process.once('deprecation', function(err) { message = err.message; });

    memory.createModel('Ctor', {'constructor': String});

    message.should.match(/Property name should not be "constructor" in Model: Ctor/);
  });

  it('should throw error for dynamic property names containing dot',
    function(done) {
      var Model = memory.createModel('DynamicDotted');
      Model.create({'dot.name': 'dot.value'}, function(err) {
        err.should.be.instanceOf(Error);
        err.message.should.match(/dot\(s\).*DynamicDotted.*dot\.name/);
        done();
      });
    });

  it('should throw error for dynamic property named constructor', function(done) {
    var Model = memory.createModel('DynamicCtor');
    Model.create({'constructor': 'myCtor'}, function(err) {
      assert.equal(err.message, 'Property name "constructor" is not allowed in DynamicCtor data');
      done();
    });
  });

  it('should support "array" type shortcut', function() {
    var Model = memory.createModel('TwoArrays', {
      regular: Array,
      sugar: 'array',
    });

    var props = Model.definition.properties;
    props.regular.type.should.equal(props.sugar.type);
  });

  context('hasPK', function() {
    context('with primary key defined', function() {
      var Todo;
      before(function prepModel() {
        Todo = new ModelDefinition(new ModelBuilder(), 'Todo', {
          content: 'string',
        });
        Todo.defineProperty('id', {
          type: 'number',
          id: true,
        });
        Todo.build();
      });

      it('should return true', function() {
        Todo.hasPK().should.be.ok;
      });
    });

    context('without primary key defined', function() {
      var Todo;
      before(function prepModel() {
        Todo = new ModelDefinition(new ModelBuilder(), 'Todo', {
          content: 'string',
        });
        Todo.build();
      });

      it('should return false', function() {
        Todo.hasPK().should.not.be.ok;
      });
    });
  });
});
