'use strict';

var model = require('./model');

module.exports = Clip;

function Clip() {
    this.value = new model.Cell(null, model.any);
}

Clip.prototype.get = function get() {
    return this.value;
};

Clip.prototype.set = function set(value) {
    this.value = value;
};
