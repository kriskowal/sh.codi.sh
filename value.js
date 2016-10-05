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
        this.component.parent = this;
    } else if (id === 'type:string') {
        this.component = scope.components.string;
        this.component.parent = this;
    } else if (id === 'type:number') {
        this.component = scope.components.number;
        this.component.parent = this;
    } else if (id === 'type:object') {
        this.component = scope.components.object;
        this.component.parent = this;
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
    this.type.value = 'string';
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyN = function () {
    this.type.value = 'number';
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyA = function () {
    this.type.value = 'array';
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyO = function () {
    this.type.value = 'object';
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

Value.prototype.delete = function _delete() {
    this.type.value = 'null';
    return this.parent.delete();
};
