'use strict';

module.exports = Value;

function Value(body, scope) {
    this.value = null;
    this.parent = null;
}

Value.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.type = scope.components.type;
        this.type.value = 'display';
    } else if (id === 'type:display') {
        scope.components.display.value = JSON.stringify(this.value);
    } else if (id === 'type:readline') {
        this.readline = scope.components.readline;
    } else if (id === 'type:array') {
        this.array = scope.components.array;
    } else if (id === 'type:object') {
        this.object = scope.components.object;
    }
};

Value.prototype.enter = function enter(parent) {
    this.focus();
    this.parent = parent;
    return this;
};

Value.prototype.$KeyS = function () {
    this.type.value = 'readline';
    this.blur();
    return this.readline.enter(new StringMode(this));
};

function StringMode(parent) {
    this.parent = parent;
}

StringMode.prototype.returnFromReadline = function _return(text, cursor) {
    return this.parent.returnWithString(text);
};

Value.prototype.$KeyN = function () {
    this.type.value = 'readline';
    this.blur();
    return this.readline.enter(new NumberMode(this));
};

Value.prototype.returnWithString = function returnWithString(text) {
    if (text != null) {
        this.value = text;
    }
    this.type.value = 'display';
    return this.parent.returnFromValue(this);
};

function NumberMode(parent) {
    this.parent = parent;
}

NumberMode.prototype.returnFromReadline = function _return(text, cursor) {
    return this.parent.returnWithNumber(text);
};

Value.prototype.returnWithNumber = function returnWithNumber(text) {
    if (text != null) {
        this.value = +text;
    }
    this.type.value = 'display';
    return this.parent.returnFromValue(this);
};

Value.prototype.$KeyA = function () {
    this.type.value = 'array';
    this.blur();
    return this.array.enter(new ArrayMode(this));
};

function ArrayMode(parent) {
    this.parent = parent;
}

ArrayMode.prototype.returnFromArray = function () {
    return this.parent.exit();
};

Value.prototype.$KeyO = function () {
    this.type.value = 'object';
    this.blur();
    return this.object.enter(new ObjectMode(this));
};

function ObjectMode(parent) {
    this.parent = parent;
}

ObjectMode.prototype.returnFromObject = function () {
    return this.parent.exit();
};

Value.prototype.$KeyT = function () {
    this.value = true;
    return this.exit();
};

Value.prototype.$KeyF = function () {
    this.value = false;
    return this.exit();
};

Value.prototype.$KeyU = function () {
    this.value = null;
    return this.exit();
};

Value.prototype.$Escape = function () {
    return this.exit();
};

Value.prototype.exit = function () {
    this.type.value = 'display';
    this.blur();
    return this.parent.returnFromValue(this);
};

Value.prototype.blur = function () {
    this.modeLine.hide(this.mode);
    this.element.classList.remove('active');
};

Value.prototype.focus = function () {
    this.modeLine.show(this.mode);
    this.element.classList.add('active');
};
