'use strict';

exports.Model = Model;
function Model(value, model) {
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

exports.Enum = EnumModel;
function EnumModel(values) {
    this.view = 'enum';
    this.namesToValues = {};
    this.valuesToNames = {};
}

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

exports.Tuple = TupleModel;
function TupleModel(fields) {
    this.type = 'tuple';
    this.view = 'array';
    this.minLength = fields.length;
    this.maxLength = fields.length;
    this.fields = fields;
};

TupleModel.prototype.get = function get(index) {
    return this.fields[index];
};

exports.Field = Field;
function Field(key, value) {
    this.key = null;
    this.value = value;
}

exports.objectField = new Field(exports.string, exports.any);

exports.Object = ObjectModel;
function ObjectModel() {
    this.entry = exports.entry;
}

ObjectModel.prototype.keys = function keys() {
    return [];
};

ObjectModel.prototype.get = function get(index) {
    return this.entry;
};

exports.Map = MapModel;
function MapModel(entry) {
    this.type = 'map';
    this.view = 'object';
    this.entry = entry;
}

exports.Struct = StructModel;
function StructModel() {
    this.fields = [];
    this.fieldsByName = {};
}

StructModel.prototype.keys = function keys() {
    return this.fields.map(key);
};

StructModel.prototype.get = function get(index) {
    return this.fields[index];
};

function key(field) {
    return field.key;
}

// TODO Union
// TODO Result
