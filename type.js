'use strict';

var model = require('./model');

module.exports = TypeView;

function TypeView() {
}

TypeView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'mode') {
        this.mode = component;
    } else if (id === 'view') {
        this.view = component;
    } else if (id === 'this') {
        this.modeLine = scope.modeLine;
    } else if (id === 'view:array') {
        this.component = scope.components.of;
        this.component.parent = this;
    } else if (id === 'view:map') {
        this.key = scope.components.key;
        this.key.parent = this;
        this.value = scope.components.value;
        this.value.parent = this;
    }
};

TypeView.prototype.focus = function focus() {
    this.view.value = 'active';
    this.modeLine.show(this.mode);
};

TypeView.prototype.blur = function blur() {
    this.view.value = 'any';
    this.modeLine.hide(this.mode);
};

TypeView.prototype.enter = function enter() {
    this.focus();
    return this;
};

TypeView.prototype.enterArrayOf = function enterArrayOf() {
    this.view.value = 'array';
    return this.component.enter();
};

TypeView.prototype.enterMapOf = function enterMapOf() {
    this.view.value = 'map';
    return this.key.enter();
};

TypeView.prototype.KeyN = function selectNumberType() {
    this.view.value = 'number';
    return this.parent.returnFromType(new model.Cell(null, model.number), this);
};

TypeView.prototype.KeyS = function selectStringType() {
    this.view.value = 'string';
    return this.parent.returnFromType(new model.Cell(null, model.string), this);
};

TypeView.prototype.KeyB = function selectBooleanType() {
    this.view.value = 'boolean';
    return this.parent.returnFromType(new model.Cell(null, model.boolean), this);
};

TypeView.prototype.KeyA = function selectArrayType() {
    this.view.value = 'array';
    return this.parent.returnFromType(model.array, this);
};

TypeView.prototype.Shift_KeyA = function selectArrayOfType() {
    this.view.value = 'array';
    return this.component.enter();
};

TypeView.prototype.KeyM = function selectMapType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Map(model.any, model.any)), this);
};

TypeView.prototype.Shift_KeyM = function selectMapOfType() {
    this.view.value = 'map';
    return this.key.enter();
};

TypeView.prototype.KeyO = function selectObjectType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Object()), this);
};

TypeView.prototype.KeyD = function selectDictType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Object(model.string)), this);
};

TypeView.prototype.returnFromType = function returnFromType(cell, child) {
    if (child === this.key) {
        this.keyModel = cell.model;
        return this.value.enter();
    } else if (child === this.value) {
        return this.parent.returnFromType(new model.Cell([], new model.Map(this.keyModel, cell.model)), this);
    } else {
        return this.parent.returnFromType(new model.Cell([], new model.Array(cell.model)), this);
    }
};
