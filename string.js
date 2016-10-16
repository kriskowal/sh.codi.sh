'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = StringView;

function StringView() {
    this.parent = null;
    this._value = new model.Cell(null, new model.String());
    this.readline = null;
}

StringView.prototype = Object.create(Child.prototype);
StringView.prototype.constructor = StringView;

Object.defineProperty(StringView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

StringView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.choose = scope.components.choose;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.choose.value = 'static';
    } else if (id === 'readline') {
        this.readline = component;
        this.readline.parent = this;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value.value;
    }
};

StringView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = this.value.value ? 'static' : 'null';
    this.modeLine.show(this.mode);
};

StringView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = this.value.value ? 'static' : 'null';
    this.modeLine.hide(this.mode);
};

StringView.prototype.draw = function draw() {
    if (this.static) {
        this.static.value = this.value.value;
    }
};

StringView.prototype.enter = function enter() {
    this.choose.value = 'dynamic'
    if (this.value.value !== null) {
        return this.reenter();
    } else {
        return this.readline.enter();
    }
};

StringView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

StringView.prototype.returnFromReadline = function returnFromReadline(text, cursor) {
    this.value.value = text;
    this.parent.update(this.value);
    if (this.parent.canProceed()) {
        this.blur();
        return this.parent.proceed();
    }
    this.focus();
    this.parent.focusChild();
    return this;
};

StringView.prototype.KeyU = function upper() {
    this.value.value = this.value.value.toUpperCase();
    this.draw();
    return this;
};

StringView.prototype.KeyL = function upper() {
    this.value.value = this.value.value.toLowerCase();
    this.draw();
    return this;
};

StringView.prototype.KeyR = function replace() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('');
};

StringView.prototype.KeyC =
StringView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter(this.value.value);
};

StringView.prototype.KeyH =
StringView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

StringView.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

StringView.prototype.tab = function tab(text) {
    this.value.value = text;
    this.draw();
    this.blur();
    return this.parent.tab();
};

StringView.prototype.canTabBack = function canTabBack() {
    return this.parent.canTabBack();
};

StringView.prototype.tabBack = function tabBack() {
    this.blur();
    return this.parent.tabBack();
};

