'use strict';

var model = require('./model');
var ArrayView = require('./array');

module.exports = MapView;

function MapView() {
    this.cursor = 0;
    this.index = {};
    this._value = new model.Cell([], model.any);
    this.parent = null;
}

MapView.prototype = Object.create(ArrayView.prototype);
MapView.prototype.constructor = MapView;

MapView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.emptyMode = scope.components.emptyMode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        this.index['$' + component.value.key] = component;
        scope.components.key.value = component.value.key;
        scope.components.key.parent = this;
        scope.components.value.value = component.value.value;
        scope.components.value.parent = this;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    }
};

MapView.prototype.canProceed = function canProceed() {
    return true;
};

MapView.prototype.proceed = function proceed() {
    return this.enter();
};

MapView.prototype.createChild = function createChild(index) {
    return new Entry(
        new model.Cell(null, this.value.model.key),
        new model.Cell(null, this.value.model.value)
    );
};

MapView.prototype.get = function get(index) {
    var key = this.elements.iterations[index].scope.components.key.value;
    var value = this.elements.iterations[index].scope.components.value.value;
    return new Entry(key, value);
};

MapView.prototype.enterChildAt = function enterChildAt(index) {
    return this.elements.iterations[index].scope.components.key.enter();
};

MapView.prototype.reenterChildAt = function reenterChildAt(index) {
    return this.elements.iterations[index].scope.components.value.reenter();
};

function Entry(key, value) {
    this.key = key;
    this.value = value;
}
