'use strict';

module.exports = Value;

function Value(body, scope) {
    this.value = null;
    this.parent = null;
    this.component = null;
}

Value.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.type = scope.components.type;
        this.type.value = 'null';
    } else if (id === 'type:null') {
        this.component = null;
    } else if (id === 'type:array') {
        this.component = scope.components.array;
    } else if (id === 'type:string') {
        this.component = scope.components.string;
    } else if (id === 'type:number') {
        this.component = scope.components.number;
    } else if (id === 'type:object') {
        this.component = scope.components.object;
    }
};

Value.prototype.enter = function enter(parent) {
    this.parent = parent;
    return this.bounce();
};

Value.prototype.reenter = function reenter(parent) {
    this.parent = parent;
    if (this.component) {
        return this.component.reenter(this);
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.bounce = function bounce() {
    if (this.component) {
        return this.component.enter(this);
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.KeyS = function () {
    this.type.value = 'string';
    this.blur();
    return this.component.enter(this);
};

Value.prototype.KeyN = function () {
    this.type.value = 'number';
    this.blur();
    return this.component.enter(this);
};

Value.prototype.KeyA = function () {
    this.type.value = 'array';
    this.blur();
    return this.component.enter(this);
};

Value.prototype.KeyO = function () {
    this.type.value = 'object';
    this.blur();
    return this.component.enter(this);
};

Value.prototype.Escape = function () {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
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

Value.prototype.delete = function _delete() {
    this.type.value = 'null';
    return this.parent.delete();
};
