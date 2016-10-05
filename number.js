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
        this.readline.parent = this;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value;
    }
};

NumberView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = this.value === this.value ? 'static' : 'null';
    this.modeLine.show(this.mode);
};

NumberView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = this.value === this.value ? 'static' : 'null';
    this.modeLine.hide(this.mode);
};

NumberView.prototype.draw = function draw() {
    if (this.value === this.value) {
        this.choose.value = 'static';
        this.static.value = this.value;
    } else {
        this.choose.value = 'null';
    }
};

NumberView.prototype.enter = function enter() {
    if (this.value !== null) {
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
    return this.readline.enter('');
};

NumberView.prototype.KeyC =
NumberView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('' + this.value);
};

NumberView.prototype.KeyH =
NumberView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};
