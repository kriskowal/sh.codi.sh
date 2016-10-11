'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = ObjectView;

function ObjectView() {
    this.cursor = 0;
    this.index = {};
    this.parent = null;
}

ObjectView.prototype = Object.create(Child.prototype);
ObjectView.prototype.constructor = ObjectView;

ObjectView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.entries = scope.components.entries;
        this.ifEmpty = scope.components.ifEmpty;
        this.ifNewEntry = scope.components.ifNewEntry;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'entries:iteration') {
        this.index['$' + component.value.key] = component;
        scope.components.key.value = component.value.key;
        scope.components.key.parent = this;
        scope.components.value.value = component.value.value;
        scope.components.value.parent = this;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    } else if (id === 'newKey') {
        this.newKey = component;
        this.newKey.parent = new NewEntry(this);
    }
};

ObjectView.prototype.bounce = function bounce() {
    if (this.cursor < this.entries.iterations.length) {
        return this.entries.iterations[this.cursor].scope.components.value.reenter();
    } else {
        return this.empty();
    }
};

ObjectView.prototype.enter = function enter() {
    return this.bounce();
};

ObjectView.prototype.canReenter = function canReenter() {
    return true;
};

ObjectView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

ObjectView.prototype.canUp = function canUp() {
    return true;
};

ObjectView.prototype.up = function up() {
    if (this.cursor === 0) {
        // TODO consider up navigation
        return this.bounce();
    }
    this.cursor--;
    return this.bounce();
};

ObjectView.prototype.canDown = function canDown() {
    return true;
};

ObjectView.prototype.down = function down() {
    if (this.cursor + 1 === this.entries.value.length) {
        // TODO consider up navigation
        return this.bounce();
    }
    this.cursor++;
    return this.bounce();
};

ObjectView.prototype.canToTop = function canToTop() {
    return true;
};

ObjectView.prototype.toTop = function toTop() {
    this.cursor = 0;
    return this.bounce();
};

ObjectView.prototype.canToBottom = function canToBottom() {
    return true;
};

ObjectView.prototype.toBottom = function toBottom() {
    this.cursor = Math.max(0, this.entries.value.length - 1);
    return this.bounce();
};

ObjectView.prototype.canAppend = function canAppend() {
    return true;
};

ObjectView.prototype.canInsert = function canInsert() {
    return false;
};

ObjectView.prototype.canPush = function canPush() {
    return false;
};

ObjectView.prototype.canUnshift = function canUnshift() {
    return false;
};

ObjectView.prototype.delete = function _delete() {
    if (this.entries.value.length === 0) {
        return this.empty();
    }
    delete this.index['$' + this.entries.value[this.cursor].key];
    this.entries.value.swap(this.cursor, 1, 0);
    if (this.cursor > 0 && this.cursor >= this.entries.value.length) {
        this.cursor--;
    }
    this.resize();
    return this.bounce();
};

ObjectView.prototype.canReturn = function canReturn() {
    return true;
};

ObjectView.prototype.return = function _return() {
    this.focus();
    return this;
};

ObjectView.prototype.resize = function resize() {
    this.ifEmpty.value = this.entries.value.length === 0;
};

ObjectView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.parent.focusChild(this);
};

ObjectView.prototype.blur = function hide() {
    this.modeLine.hide(this.mode);
    this.parent.blurChild(this);
};

ObjectView.prototype.empty = function empty() {
    this.focusEmpty();
    return new Empty(this);
};

ObjectView.prototype.append = function append() {
    this.focusNewEntry();
    return this.newKey.enter();
};

ObjectView.prototype.canTab = function canTab() {
    return false; // TODO
};

ObjectView.prototype.canTabBack = function canTabBack() {
    return false; // TODO
};

ObjectView.prototype.key = function key(key) {
    this.blurNewEntry();
    if (key === '') {
        this.resize();
        return this.bounce();
    }
    if (this.index['$' + key]) {
        return this.index['$' + key].scope.components.value.reenter();
    }
    this.cursor = this.entries.value.length;
    this.entries.value.push({
        key: key,
        value: new model.Model(null, model.any)
    }); // TODO model properly
    this.resize();
    return this.entries.iterations[this.cursor].scope.components.value.enter();
};

function NewEntry(parent) {
    this.parent = parent;
}

NewEntry.prototype.returnFromReadline = function returnFromReadline(key) {
    return this.parent.key(key);
};

ObjectView.prototype.focusEmpty = function focusEmpty() {
    this.modeLine.show(this.mode);
    this.emptyElement.classList.add('active');
};

ObjectView.prototype.blurEmpty = function blurEmpty() {
    this.modeLine.hide(this.mode);
    this.emptyElement.classList.remove('active');
};

ObjectView.prototype.focusNewEntry = function focusNewEntry() {
    this.ifEmpty.value = false;
    this.ifNewEntry.value = true;
};

ObjectView.prototype.blurNewEntry = function blurNewEntry() {
    this.ifNewEntry.value = false;
};

ObjectView.prototype.KeyL =
ObjectView.prototype.Enter = function enter() {
    this.blur();
    return this.bounce();
};

function Empty(parent) {
    this.parent = parent;
}

Empty.prototype = Object.create(Child.prototype);
Empty.prototype.constructor = Empty;

Empty.prototype.Enter = function enter() {
    return this.parent.append();
};

Empty.prototype.blur = function blur() {
    this.parent.blurEmpty();
};
