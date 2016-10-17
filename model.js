'use strict';

exports.Cell = Cell;
function Cell(value, model) {
    this.value = value;
    this.model = model;
}

Cell.prototype.toJSON = function toJSON() {
    return this.model.toJSON(this.value);
};

function AnyModel() {
    this.type = 'any';
    this.view = 'any';
}
exports.any = new AnyModel();
AnyModel.prototype.toJSON = function toJSON(cell) {
    if (cell != null) {
        return cell.toJSON();
    }
    return null;
};

exports.String = StringModel;
function StringModel() {
    this.type = 'string';
    this.view = 'string';
    this.range = [];
}
exports.string = new StringModel();
StringModel.prototype.toJSON = function toJSON(value) {
    return value;
};

exports.Number = NumberModel;
function NumberModel() {
    this.type = 'number';
    this.view = 'number';
    this.min = -Infinity;
    this.max = +Infinity;
}
NumberModel.prototype.toJSON = function toJSON(value) {
    return value;
};
exports.number = new NumberModel();

function BooleanModel() {
    this.type = 'boolean';
    this.view = 'boolean';
}
BooleanModel.prototype.toJSON = function toJSON(value) {
    return value;
};
exports.boolean = new BooleanModel();

exports.Array = ArrayModel;
function ArrayModel(value) {
    this.type = 'array';
    this.view = 'array';
    this.value = value || exports.any;
    this.minLength = 0;
    this.maxLength = Infinity;
}
ArrayModel.prototype.toJSON = function toJSON(value) {
    var json = [];
    for (var i = 0; i < value.length; i++) {
        var cell = value[i];
        json.push(cell.toJSON());
    }
    return json;
};
exports.array = new ArrayModel();

ArrayModel.prototype.get = function get(array, index) {
    return this.value;
};

exports.Object = ObjectModel;
function ObjectModel(value) {
    this.type = 'object';
    this.view = 'map';
    this.key = exports.string;
    this.value = value || exports.any;
}
ObjectModel.prototype.toJSON = function toJSON(entries) {
    var json = {};
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var key = entry.key.toJSON();
        var value = entry.value.toJSON();
        json[key] = value;
    }
    return json;
};
ObjectModel.prototype.get = function get(index) {
    return this;
};

exports.Map = MapModel;
function MapModel(key, value) {
    this.type = 'map';
    this.view = 'map';
    this.key = key;
    this.value = value;
}
MapModel.prototype.toJSON = function toJSON(entries) {
    var json = [];
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var key = entry.key.toJSON();
        var value = entry.value.toJSON();
        json.push([key, value]);
    }
    return json;
};
MapModel.prototype.get = function get(index) {
    return this;
};

// TODO Enum
// TODO Tuple
// TODO Struct
// TODO Union
// TODO Result
