'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = ArrayView;

// TODO focus empty element if empty

function ArrayView() {
    this.cursor = 0;
    this._value = new model.Cell([], model.array);
    this.parent = null;
}

ArrayView.prototype = Object.create(Child.prototype);
ArrayView.prototype.constructor = ArrayView;

ArrayView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.emptyMode = scope.components.emptyMode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        scope.components.element.parent = this;
        scope.components.element.value = component.value;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    }
};

Object.defineProperty(ArrayView.prototype, 'value', {
    get: function getValue() {
        var value = [];
        for (var i = 0; i < this.elements.value.length; i++) {
            value.push(this.get(i));
        }
        return new model.Cell(value, this._value.model);
    },
    set: function setValue(cell) {
        var value = cell.value;
        if (value == null) {
            this.elements.value.clear();
            return;
        }
        this.elements.value = cell.value.slice();
        this._value.model = cell.model;
        this.resize();
    }
});

ArrayView.prototype.createChild = function createChild(index) {
    return new model.Cell(null, this.value.model.get(index));
};

ArrayView.prototype.swap = function swap(index, minus, plus) {
    var array = [];
    for (var i = 0; i < plus; i++) {
        array.push(this.createChild(index + i));
    }
    this.elements.value.swap(this.cursor, minus, array);
    this.parent.update();
    this.resize();
};

ArrayView.prototype.get = function get(index) {
    return this.elements.iterations[index].scope.components.element.value;
};

ArrayView.prototype.update = function update(value) {
    this._value.value[this.cursor] = value;
    this.parent.update(this.value);
};

ArrayView.prototype.enter = function enter() {
    if (this.cursor < this.elements.value.length) {
        return this.reenterChildAt(this.cursor);
    } else {
        return this.enterEmptyMode();
    }
};

ArrayView.prototype.enterChild = function enterChild() {
    if (this.cursor < this.elements.value.length) {
        return this.enterChildAt(this.cursor);
    } else {
        return this.enterEmptyMode();
    }
};

ArrayView.prototype.reenterChildAt = function reenterChildAt(index) {
    return this.elements.iterations[index].scope.components.element.reenter();
};

ArrayView.prototype.enterChildAt = function enterChildAt(index) {
    return this.elements.iterations[index].scope.components.element.enter();
};

ArrayView.prototype.enterEmptyMode = function enterEmptyMode() {
    this.focusEmpty();
    return new Empty(this);
};

ArrayView.prototype.blurEmpty = function blurEmpty() {
    this.modeLine.hide(this.emptyMode);
    this.emptyElement.classList.remove('active');
};

ArrayView.prototype.focusEmpty = function focusEmpty() {
    this.modeLine.show(this.emptyMode);
    this.emptyElement.classList.add('active');
};

ArrayView.prototype.exit = function () {
    this.blur();
    return this.parent.return();
};

ArrayView.prototype.resize = function resize() {
    this.ifEmpty.value = this.elements.value.length === 0;
};

ArrayView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.parent.focusChild();
};

ArrayView.prototype.blur = function hide() {
    this.modeLine.hide(this.mode);
    this.parent.blurChild();
};

ArrayView.prototype.canPush = function canPush() {
    return true;
};

ArrayView.prototype.push = function push() {
    this.blurEmpty();
    this.cursor = this.elements.value.length;
    this.swap(this.elements.value.length, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canUnshift = function canUnshift() {
    return true;
};

ArrayView.prototype.unshift = function unshift() {
    this.blurEmpty();
    this.cursor = 0;
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canAppend = function canAppend() {
    return true;
};

ArrayView.prototype.append = function append() {
    if (this.elements.value.length === 0) {
        return this.push();
    }
    this.cursor++;
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canInsert = function canInsert() {
    return true;
};

ArrayView.prototype.insert = function insert() {
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canReenter = function canReenter() {
    return true;
};

ArrayView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

ArrayView.prototype.canUp = function canUp() {
    return true;
};

ArrayView.prototype.up = function up() {
    if (this.cursor === 0) {
        // TODO consider up navigation
        return this.enter();
    }
    this.cursor--;
    return this.enter();
};

ArrayView.prototype.canDown = function canDown() {
    return true;
};

ArrayView.prototype.down = function down() {
    if (this.cursor + 1 === this.elements.value.length) {
        // TODO consider up navigation
        return this.enter();
    }
    this.cursor++;
    return this.enter();
};

ArrayView.prototype.canToTop = function canToTop() {
    return true;
};

ArrayView.prototype.toTop = function toTop() {
    this.cursor = 0;
    return this.enter();
};

ArrayView.prototype.canToBottom = function canToBottom() {
    return true;
};

ArrayView.prototype.toBottom = function toBottom() {
    this.cursor = Math.max(0, this.elements.value.length - 1);
    return this.enter();
};

ArrayView.prototype.delete = function _delete() {
    this.swap(this.cursor, 1, 0);
    if (this.cursor > 0 && this.cursor >= this.elements.value.length) {
        this.cursor--;
    }
    return this.enter();
};

ArrayView.prototype.canReturn = function canReturn() {
    return true;
};

ArrayView.prototype.return = function _return() {
    this.focus();
    return this;
};

ArrayView.prototype.KeyL =
ArrayView.prototype.Enter = function enter() {
    this.blur();
    return this.enter();
};

ArrayView.prototype.canTab = function canTab() {
    return true;
};

ArrayView.prototype.tab = function tab() {
    return this.append();
};

ArrayView.prototype.canTabBack = function canTabBack() {
    return false; // TODO
};

ArrayView.prototype.canProceed = function canProceed() {
    return false;
};

function Empty(parent) {
    this.parent = parent;
}

Empty.prototype = Object.create(Child.prototype);
Empty.prototype.constructor = Empty;

Empty.prototype.blur = function blur() {
    this.parent.blurEmpty();
};

Empty.prototype.Enter =
Empty.prototype.KeyA = function append() {
    this.blur();
    return this.parent.push();
};

Empty.prototype.KeyI = function insert() {
    this.blur();
    return this.parent.unshift();
};
