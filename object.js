'use strict';

module.exports = ObjectView;

function ObjectView() {
    this.cursor = 0;
    this.index = {};
    this.parent = null;
}

ObjectView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.entries = scope.components.entries;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'entries:iteration') {
        this.index['$' + component.value.key] = component;
        scope.components.key.value = component.value.key;
        scope.components.value.value = component.value.value;
    }
};

ObjectView.prototype.enter = function enter(parent) {
    this.parent = parent;
    this.modeLine.show(this.mode);
    this.activateIteration(this.cursor);
    return this;
};

ObjectView.prototype.resize = function resize() {
    this.ifEmpty.value = this.entries.value.length === 0;
};

ObjectView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.activateIteration(this.cursor);
};

ObjectView.prototype.blur = function hide() {
    this.modeLine.hide(this.mode);
    this.deactivateIteration(this.cursor);
};

ObjectView.prototype.activateIteration = function activateIteration(index) {
    if (index < this.entries.value.length) {
        this.entries.iterations[index].scope.components.keyBox.classList.add("active");
    }
};

ObjectView.prototype.deactivateIteration = function deactivateIteration(index) {
    if (index < this.entries.value.length) {
        this.entries.iterations[index].scope.components.keyBox.classList.remove("active");
    }
};

ObjectView.prototype.focusIteration = function focusIteration(index) {
    this.deactivateIteration(this.cursor);
    var iteration = this.entries.iterations[index];
    return iteration.scope.components.element.enter(this);
};

ObjectView.prototype.moveCursor = function (index) {
    index = Math.min(Math.max(index, 0), this.entries.value.length);
    if (this.cursor === index) {
        return;
    }
    this.deactivateIteration(this.cursor);
    this.cursor = index;
    this.activateIteration(this.cursor);
};

ObjectView.prototype.$KeyS = function () {
    this.ifEmpty.value = false;
    this.scope.components.ifNewEntry.value = true;
    this.blur();
    return this.scope.components.ifNewEntry.component.scope.components.newKey.enter(new NewKeyMode(this));
};

ObjectView.prototype.key = function key(key) {
    this.scope.components.ifNewEntry.value = false;
    if (!this.index['$' + key]) {
        this.entries.value.push({
            key: key,
            value: null
        });
    }
    return this.index['$' + key].scope.components.value.enter(new SetMode(this, key));
};

ObjectView.prototype.set = function set(key, value) {
    this.focus();
    this.moveCursor(this.index['$' + key].index);
    return this;
};

function NewKeyMode(parent) {
    this.parent = parent;
}

NewKeyMode.prototype.returnFromReadline = function (key) {
    return this.parent.key(key);
};

function SetMode(parent, key) {
    this.parent = parent;
    this.key = key;
}

SetMode.prototype.returnFromValue = function (value) {
    return this.parent.set(this.key, value);
};

ObjectView.prototype.$KeyG =
ObjectView.prototype.$Ctrl$KeyA = function () {
    this.moveCursor(0);
    return this;
};

ObjectView.prototype.$Shift$KeyG = 
ObjectView.prototype.$Ctrl$KeyE = function () {
    this.moveCursor(Math.max(0, this.entries.value.length - 1));
    return this;
};

ObjectView.prototype.$KeyJ = function () {
    this.moveCursor((this.cursor + 1) % this.entries.value.length);
    return this;
};

ObjectView.prototype.$KeyK = function () {
    this.moveCursor((this.entries.value.length + this.cursor - 1) % this.entries.value.length);
    return this;
};

ObjectView.prototype.$KeyD = function () {
    var iteration = this.entries.iterations[this.cursor];
    if (iteration) {
        delete this.index['$' + iteration.value.key];
        this.deactivateIteration(this.cursor);
        this.entries.value.swap(this.cursor, 1, []);
        this.resize();
        if (this.cursor > 0 && this.cursor >= this.entries.value.length) {
            this.cursor--;
        }
        this.activateIteration(this.cursor);
    }
    return this;
};

ObjectView.prototype.$Enter = function () {
    var iteration = this.entries.iterations[this.cursor];
    if (iteration) {
        this.blur();
        return iteration.scope.components.value.enter(new SetMode(this, iteration.value.key));
    }
    return this;
};
