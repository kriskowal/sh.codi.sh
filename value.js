'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = Value;

function Value(body, scope) {
    this._value = new model.Model(null, model.any);
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
    } else if (id === 'view:object') {
        this.component = scope.components.object;
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
    this.value = new model.Model(null, model.string);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyN = function () {
    this.value = new model.Model(null, model.number);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyT = function () {
    this.value = new model.Model(true, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyF = function () {
    this.value = new model.Model(false, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyA = function () {
    this.value = new model.Model([], model.array);
    this.blur();
    return this.component.enter();
};

// TODO parameterize array and object/map types
Value.prototype.Shift_KeyA = function () {
    this.value = new model.Model([], new model.Array(model.string));
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyO = function () {
    this.view.value = 'object';
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

// Delegate to parent

Value.prototype.canReturn = function canReturn() {
    return this.parent.canReturn();
};

Value.prototype.return = function _return() {
    return this.parent.return();
};

Value.prototype.canDown = function canDown() {
    return this.parent.canDown();
};

Value.prototype.down = function down() {
    return this.parent.down();
};

Value.prototype.canUp = function canUp() {
    return this.parent.canUp();
};

Value.prototype.up = function up() {
    return this.parent.up();
};

Value.prototype.canAppend = function canAppend() {
    return this.parent.canAppend();
};

Value.prototype.append = function append() {
    return this.parent.append();
};

Value.prototype.canInsert = function canInsert() {
    return this.parent.canInsert();
};

Value.prototype.insert = function insert() {
    return this.parent.insert();
};

Value.prototype.canUnshift = function canUnshift() {
    return this.parent.canUnshift();
};

Value.prototype.unshift = function unshift() {
    return this.parent.unshift();
};

Value.prototype.canPush = function canPush() {
    return this.parent.canPush();
};

Value.prototype.push = function push() {
    return this.parent.push();
};

Value.prototype.canToTop = function canToTop() {
    return this.parent.canToTop();
};

Value.prototype.toTop = function toTop() {
    return this.parent.toTop();
};

Value.prototype.canToBottom = function canToBottom() {
    return this.parent.canToBottom();
};

Value.prototype.toBottom = function toBottom() {
    return this.parent.toBottom();
};

Value.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

Value.prototype.tab = function tab() {
    return this.parent.tab();
};

Value.prototype.delete = function _delete() {
    return this.parent.delete();
};

// TODO list
// TODO tuple
// TODO object
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
