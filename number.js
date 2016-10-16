'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = NumberView;

function NumberView() {
    this.parent = null;
    this._value = new model.Cell(null, new model.Number());
    this.readline = null;
}

NumberView.prototype = Object.create(Child.prototype);
NumberView.prototype.constructor = NumberView;

Object.defineProperty(NumberView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

NumberView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.choose = scope.components.choose;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.choose.value = 'static';
    } else if (id === 'readline') {
        this.readline = component;
        this.readline.parent = this;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value.value;
    }
};

NumberView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = this.value.value === this.value.value ? 'static' : 'null';
    this.modeLine.show(this.mode);
};

NumberView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = this.value.value === this.value.value ? 'static' : 'null';
    this.modeLine.hide(this.mode);
};

NumberView.prototype.draw = function draw() {
    if (this.value.value === this.value.value) {
        this.choose.value = 'static';
        this.static.value = this.value.value;
    } else {
        this.choose.value = 'null';
    }
};

NumberView.prototype.enter = function enter() {
    this.choose.value = 'dynamic';
    if (this.value.value !== null) {
        return this.reenter();
    } else {
        return this.readline.enter();
    }
};

NumberView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

NumberView.prototype.returnFromReadline = function returnFromReadline(text, cursor) {
    if (text == null) {
        if (this.value.value === null) {
            return this.parent.delete();
        } else if (this.parent.canReturn()) {
            return this.parent.return();
        }
    } else {
        this.value.value = +text.replace(/,/g, '');
    }
    this.focus();
    this.parent.focusChild();
    this.draw();
    return this;
};

NumberView.prototype.KeyR = function replace() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('');
};

NumberView.prototype.KeyC =
NumberView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('' + this.value.value);
};

NumberView.prototype.KeyH =
NumberView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

NumberView.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

NumberView.prototype.tab = function tab(number) {
    this.value.value = +number;
    this.draw();
    this.blur();
    return this.parent.tab();
};

NumberView.prototype.canTabBack = function canTabBack() {
    return this.parent.canTabBack();
};

NumberView.prototype.tabBack = function tabBack() {
    this.blur();
    return this.parent.tabBack();
};
