'use strict';

var Child = require('./child');

module.exports = StringView;

function StringView() {
    this.parent = null;
    this.value = null;
    this.readline = null;
}

StringView.prototype = Object.create(Child.prototype);
StringView.prototype.constructor = StringView;

StringView.prototype.hookup = function hookup(id, component, scope) {
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

StringView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = 'static';
    this.modeLine.show(this.mode);
};

StringView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = 'static';
    this.modeLine.hide(this.mode);
};

StringView.prototype.draw = function draw() {
    this.static.value = this.value;
};

StringView.prototype.enter = function enter() {
    if (this.value !== null) {
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
    this.value = text;
    this.focus();
    this.parent.focusChild();
    return this;
};

StringView.prototype.KeyU = function upper() {
    this.value = this.value.toUpperCase();
    this.draw();
    return this;
};

StringView.prototype.KeyL = function upper() {
    this.value = this.value.toLowerCase();
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
    return this.readline.enter(this.value);
};

StringView.prototype.KeyH =
StringView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};
