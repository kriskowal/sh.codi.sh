'use strict';

var Child = require('./child');

module.exports = NumberView;

function NumberView() {
    this.parent = null;
    this.value = null;
    this.readline = null;
}

NumberView.prototype = Object.create(Child.prototype);
NumberView.prototype.constructor = NumberView;

NumberView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.choose = scope.components.choose;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.choose.value = 'dynamic';
    } else if (id === 'readline') {
        this.readline = component;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value;
    }
};

NumberView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = 'static';
    this.modeLine.show(this.mode);
};

NumberView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = 'static';
    this.modeLine.hide(this.mode);
};

NumberView.prototype.draw = function draw() {
    this.static.value = this.value;
};

NumberView.prototype.enter = function enter(parent) {
    if (this.value !== null) {
        return this.reenter(parent);
    } else {
        this.parent = parent;
        return this.readline.enter(this);
    }
};

NumberView.prototype.reenter = function reenter(parent) {
    this.parent = parent;
    this.focus();
    return this;
};

NumberView.prototype.returnFromReadline = function returnFromReadline(text, cursor) {
    if (text == null) {
        if (this.value === null) {
            return this.parent.delete();
        } else if (this.parent.canReturn()) {
            return this.parent.return();
        }
    } else {
        this.value = +text.replace(/,/g, '');
    }
    this.focus();
    this.parent.focusChild();
    this.draw();
    return this;
};

NumberView.prototype.KeyR = function replace() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter(this, '');
};

NumberView.prototype.KeyC =
NumberView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter(this, '' + this.value);
};

NumberView.prototype.KeyH =
NumberView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};
