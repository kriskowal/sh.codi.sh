"use strict";
var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Animator = require('blick');
var Root = require("./root.html");
var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.main = new Root(document.documentElement, scope);
