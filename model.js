'use strict';

exports.Cell = Cell;
function Cell(value, model) {
    this.value = value;
    this.model = model;
}

function AnyModel() {
    this.type = 'any';
    this.view = 'any';
}
exports.any = new AnyModel();

function NullModel() {
    this.type = 'null';
    this.view = 'null';
}
exports.null = new NullModel();

exports.String = StringModel;
function StringModel() {
    this.type = 'string';
    this.view = 'string';
    this.range = [];
}
exports.string = new StringModel();

exports.Number = NumberModel;
function NumberModel() {
    this.type = 'number';
    this.view = 'number';
    this.min = -Infinity;
    this.max = +Infinity;
}
exports.number = new NumberModel();

function BooleanModel() {
    this.type = 'boolean';
    this.view = 'boolean';
}
exports.boolean = new BooleanModel();

exports.Array = ArrayModel;
function ArrayModel(valueModel) {
    this.type = 'array';
    this.view = 'array';
    this.valueModel = valueModel || exports.any;
    this.minLength = 0;
    this.maxLength = Infinity;
}

ArrayModel.prototype.get = function get(array, index) {
    return this.valueModel;
};

exports.array = new ArrayModel();

exports.Object = ObjectModel;
function ObjectModel() {
    this.type = 'object';
    this.view = 'map';
    this.key = exports.string;
    this.value = exports.any;
}

ObjectModel.prototype.get = function get(index) {
    return this.entry;
};

// TODO Map
// TODO Enum
// TODO Tuple
// TODO Struct
// TODO Union
// TODO Result
