'use strict';

module.exports = ArrayView;

// TODO focus empty element if empty

function ArrayView() {
    this.cursor = 0;
    this.parent = null;
}

ArrayView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        scope.components.element.value = component.value;
    }
};

ArrayView.prototype.enter = function enter(parent) {
    this.parent = parent;
    this.focus();
    return this;
};

ArrayView.prototype.exit = function () {
    this.blur();
    return this.parent.returnFromArray();
};

ArrayView.prototype.returnFromValue = function () {
    this.focus();
    return this;
};

ArrayView.prototype.resize = function resize() {
    this.ifEmpty.value = this.elements.value.length === 0;
};

ArrayView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.activateIteration(this.cursor);
};

ArrayView.prototype.blur = function hide() {
    this.modeLine.hide(this.mode);
    this.deactivateIteration(this.cursor);
};

ArrayView.prototype.activateIteration = function activateIteration(index) {
    if (index < this.elements.value.length) {
        this.elements.iterations[index].scope.components.elementBox.classList.add("active");
    }
};

ArrayView.prototype.deactivateIteration = function deactivateIteration(index) {
    if (index < this.elements.value.length) {
        this.elements.iterations[index].scope.components.elementBox.classList.remove("active");
    }
};

ArrayView.prototype.focusIteration = function focusIteration(index) {
    this.deactivateIteration(this.cursor);
    var iteration = this.elements.iterations[index];
    return iteration.scope.components.element.enter(this);
};

ArrayView.prototype.moveCursor = function (index) {
    index = Math.min(Math.max(index, 0), this.elements.value.length);
    if (this.cursor === index) {
        return;
    }
    this.deactivateIteration(this.cursor);
    this.cursor = index;
    this.activateIteration(this.cursor);
};

// TODO Ctrl+K and Ctrl+U for clear in direction from cursor
// TODO backspace, delete

ArrayView.prototype.$KeyG =
ArrayView.prototype.$Ctrl$KeyA = function () {
    this.moveCursor(0);
    return this;
};

ArrayView.prototype.$Shift$KeyG = 
ArrayView.prototype.$Ctrl$KeyE = function () {
    this.moveCursor(Math.max(0, this.elements.value.length - 1));
    return this;
};

ArrayView.prototype.$Escape = function () {
    return this.exit();
};

ArrayView.prototype.$KeyD = function () {
    this.deactivateIteration(this.cursor);
    this.elements.value.swap(this.cursor, 1, []);
    this.resize();
    if (this.cursor > 0 && this.cursor >= this.elements.value.length) {
        this.cursor--;
    }
    this.activateIteration(this.cursor);
    return this;
};

ArrayView.prototype.$Shift$KeyI = function () {
    this.deactivateIteration(this.cursor);
    this.cursor = 0;
    this.elements.value.swap(0, 0, [0]);
    this.resize();
    return this.focusIteration(0);
};

ArrayView.prototype.$Shift$KeyA = function () {
    this.deactivateIteration(this.cursor);
    this.cursor = this.elements.value.length;
    this.elements.value.swap(this.elements.value.length, 0, [0]);
    this.resize();
    return this.focusIteration(this.cursor);
};

ArrayView.prototype.$KeyI = function () {
    this.deactivateIteration(this.cursor);
    var index;
    if (this.elements.value.length === 0) {
        index = 0;
        this.elements.value.push(0);
    } else {
        index = this.cursor;
        this.elements.value.swap(index, 0, [0]);
    }
    this.resize();
    return this.focusIteration(index);
};

ArrayView.prototype.$KeyA = function () {
    var index;
    this.deactivateIteration(this.cursor);
    if (this.elements.value.length === 0) {
        index = 0;
        this.elements.value.push(0);
    } else {
        this.cursor++;
        this.elements.value.swap(this.cursor, 0, [0]);
    }
    this.resize();
    return this.focusIteration(this.cursor);
};

ArrayView.prototype.$Enter = function () {
    if (this.cursor < this.elements.value.length) {
        return this.focusIteration(this.cursor);
    }
    return this;
};

ArrayView.prototype.$KeyJ = function () {
    this.moveCursor((this.cursor + 1) % this.elements.value.length);
    return this;
};

ArrayView.prototype.$KeyK = function () {
    this.moveCursor((this.elements.value.length + this.cursor - 1) % this.elements.value.length);
    return this;
};
