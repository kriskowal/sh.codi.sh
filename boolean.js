'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = BooleanView;

function BooleanView() {
    this._value = new model.Cell(false, model.boolean);
    this.parent = null;
}

BooleanView.prototype = Object.create(Child.prototype);
BooleanView.prototype.constructor = BooleanView;

BooleanView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.modeLine = scope.modeLine;
        this.mode = scope.components.mode;
        this.choose = scope.components.choose;
    }
};

Object.defineProperty(BooleanView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

BooleanView.prototype.draw = function draw() {
    this.choose.value = this._value.value ? 'true' : 'false';
};

BooleanView.prototype.enter = function enter() {
    this.focus();
    return this;
};

BooleanView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

BooleanView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.parent.focusChild();
};

BooleanView.prototype.blur = function blur() {
    this.modeLine.hide(this.mode);
    this.parent.blurChild();
};

BooleanView.prototype.KeyT = function _true() {
    this.value.value = true;
    this.draw();
    return this;
};

BooleanView.prototype.KeyF = function _false() {
    this.value.value = false;
    this.draw();
    return this;
};

BooleanView.prototype.Shift_Digit1 =
BooleanView.prototype.Space =
BooleanView.prototype.KeyN = function negate() {
    this.value.value = !this.value.value;
    this.draw();
    return this;
};
