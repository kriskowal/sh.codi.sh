'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = Value;

function Value(body, scope) {
    this._value = new model.Cell(null, model.any);
    this.parent = null;
    this.component = null;
}

Value.prototype = Object.create(Child.prototype);
Value.prototype.constructor = Value;

Object.defineProperty(Value.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.view.value = value.model.view;
        if (this.component) {
            this.component.value = value;
        }
    }
});

Value.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.view = scope.components.view;
    } else if (id === 'view:any') {
        this.component = null;
    } else if (id === 'view:null') {
        this.component = null;
    } else if (id === 'view:string') {
        this.component = scope.components.string;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:number') {
        this.component = scope.components.number;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:boolean') {
        this.component = scope.components.boolean;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:array') {
        this.component = scope.components.array;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:map') {
        this.component = scope.components.map;
        this.component.parent = this;
        this.component.value = this.value;
    }
};

Value.prototype.enter = function enter() {
    return this.bounce();
};

Value.prototype.canReenter = function canReenter() {
    return true;
};

Value.prototype.reenter = function reenter() {
    if (this.component) {
        return this.component.reenter();
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.bounce = function bounce() {
    if (this.component) {
        return this.component.enter();
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.KeyS = function () {
    this.value = new model.Cell(null, model.string);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyN = function () {
    this.value = new model.Cell(null, model.number);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyT = function () {
    this.value = new model.Cell(true, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyF = function () {
    this.value = new model.Cell(false, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyA = function () {
    this.value = new model.Cell([], model.array);
    this.blur();
    return this.component.enter();
};

Value.prototype.Shift_KeyA = function () {
    this.value = new model.Cell([], new model.Array(model.string));
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyO = function () {
    this.value = new model.Cell([], new model.Object());
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyH =
Value.prototype.Escape = function () {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

Value.prototype.KeyP = function () {
    this.value = this.scope.clip.get();
    this.blur();
    return this.bounce();
};

Value.prototype.blurChild = function () {
    this.element.classList.remove('active');
};

Value.prototype.focusChild = function () {
    this.element.classList.add('active');
};

Value.prototype.blur = function () {
    this.modeLine.hide(this.mode);
    this.element.classList.remove('active');
};

Value.prototype.focus = function () {
    this.modeLine.show(this.mode);
    this.element.classList.add('active');
};

// TODO list
// TODO tuple
// TODO dict
// TODO map
// TODO struct
// TODO union
// TODO enum
// TODO binary data
// TODO image (dimensions)
// TODO plane
// TODO matrix
// TODO earth lat,lng
// TODO color
