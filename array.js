'use strict';

var Child = require('./child');

module.exports = ArrayView;

// TODO focus empty element if empty

function ArrayView() {
    this.cursor = 0;
    this.parent = null;
}

ArrayView.prototype = Object.create(Child.prototype);
ArrayView.prototype.constructor = ArrayView;

ArrayView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
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

ArrayView.prototype.swap = function swap(index, minus, plus) {
    var array = [];
    for (var i = 0; i < plus; i++) {
        array.push({}); // TODO model
    }
    this.elements.value.swap(this.cursor, minus, array);
    this.resize();
};

ArrayView.prototype.bounce = function bounce() {
    if (this.cursor < this.elements.value.length) {
        return this.elements.iterations[this.cursor].scope.components.element.reenter();
    } else {
        return this.empty();
    }
};

ArrayView.prototype.empty = function empty() {
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
    this.modeLine.show(this.emptyMode);
    this.parent.focusChild();
};

ArrayView.prototype.blur = function hide() {
    this.modeLine.hide(this.emptyMode);
    this.parent.blurChild();
};

ArrayView.prototype.returnFromValue = function () {
    this.focus();
    return this;
};

ArrayView.prototype.canPush = function canPush() {
    return this;
};

ArrayView.prototype.push = function push() {
    this.blurEmpty();
    this.cursor = this.elements.value.length;
    this.swap(this.elements.value.length, 0, 1);
    return this.bounce();
};

ArrayView.prototype.canUnshift = function canUnshift() {
    return this;
};

ArrayView.prototype.unshift = function unshift() {
    this.blurEmpty();
    this.cursor = 0;
    this.swap(this.cursor, 0, 1);
    return this.bounce();
};

ArrayView.prototype.canAppend = function canAppend() {
    return true;
};

ArrayView.prototype.append = function append() {
    this.cursor++;
    this.swap(this.cursor, 0, 1);
    return this.bounce();
};

ArrayView.prototype.canInsert = function canInsert() {
    return true;
};

ArrayView.prototype.insert = function insert() {
    this.swap(this.cursor, 0, 1);
    return this.bounce();
};

ArrayView.prototype.enter = function enter() {
    return this.bounce();
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
        return this.bounce();
    }
    this.cursor--;
    return this.bounce();
};

ArrayView.prototype.canDown = function canDown() {
    return true;
};

ArrayView.prototype.down = function down() {
    if (this.cursor + 1 === this.elements.value.length) {
        // TODO consider up navigation
        return this.bounce();
    }
    this.cursor++;
    return this.bounce();
};

ArrayView.prototype.canToTop = function canToTop() {
    return true;
};

ArrayView.prototype.toTop = function toTop() {
    this.cursor = 0;
    return this.bounce();
};

ArrayView.prototype.canToBottom = function canToBottom() {
    return true;
};

ArrayView.prototype.toBottom = function toBottom() {
    this.cursor = Math.max(0, this.elements.value.length - 1);
    return this.bounce();
};

ArrayView.prototype.delete = function () {
    this.swap(this.cursor, 1, 0);
    if (this.cursor > 0 && this.cursor >= this.elements.value.length) {
        this.cursor--;
    }
    return this.bounce();
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
    return this.bounce();
};

function Empty(parent) {
    this.parent = parent;
}

Empty.prototype = Object.create(Child.prototype);
Empty.prototype.constructor = Empty;

Empty.prototype.blur = function blur() {
    this.parent.blurEmpty();
};

Empty.prototype.KeyA = function append() {
    this.blur();
    return this.parent.push();
};

Empty.prototype.KeyI = function insert() {
    this.blur();
    return this.parent.unshift();
};
