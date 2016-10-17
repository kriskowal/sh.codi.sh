'use strict';

var Clip = require('./clip');
var model = require('./model');

module.exports = Root;

function Root(body, scope) {
    this.component = null;
    this.modeLine = null;
    this.handler = null;
}

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    } else if (id === 'modeLine') {
        scope.root.modeLine = component;
    }
};

Object.defineProperty(Root.prototype, 'value', {
    get: function getValue() {
        return this.component.value;
    },
    set: function setValue(value) {
        this.component.value = value;
    }
});

Root.prototype.update = function udpate(value) {
    this.parent.update(this.value);
};

Root.prototype.enter = function enter() {
    return this.component.enter();
};

Root.prototype.hookupThis = function hookupThis(scope) {
    scope.root.clip = new Clip();
    this.component = scope.components.component;
    this.component.parent = this;
    this.modeLine = scope.components.modeLine;
};

Root.prototype.delete = function _delete() {
    this.value = new model.Cell(null, model.any);
    this.parent.update(this.value);
    return this.component.enter();
};

Root.prototype.canReturn = function canReturn() {
    return false;
};

Root.prototype.canReenter = function canReenter() {
    return false;
};

Root.prototype.canDown = function canDown() {
    return false;
};

Root.prototype.canUp = function canUp() {
    return false;
};

Root.prototype.canInsert = function canInsert() {
    return false;
};

Root.prototype.canPush = function canPush() {
    return false;
};

Root.prototype.canUnshift = function canUnshift() {
    return false;
};

Root.prototype.canAppend = function canAppend() {
    return false;
};

Root.prototype.canToTop = function canToTop() {
    return false;
};

Root.prototype.canToBottom = function canToBottom() {
    return false;
};

Root.prototype.canTab = function canTab() {
    return false;
};

Root.prototype.canTabBack = function canTabBack() {
    return false;
};

Root.prototype.canProceed = function canProceed() {
    return false;
};
