'use strict';

module.exports = ModeLine;

function ModeLine(body, scope) {
    this.body = body;
}

ModeLine.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(component, scope);
    } else if (id === 'modes:iteration') {
        this.hookupMode(component, scope);
    }
};

ModeLine.prototype.hookupThis = function hookupThis(component, scope) {
    this.modes = scope.components.modes;
};

ModeLine.prototype.hookupMode = function (iteration, scope) {
    var mode = iteration.value;
    scope.components.slot.body.appendChild(mode.componentBody);
    mode.element = scope.components.mode;
};

ModeLine.prototype.show = function show(mode) {
    if (!mode.element) {
        this.modes.value.push(mode);
    }
    mode.show();
};

ModeLine.prototype.hide = function hide(mode) {
    mode.hide();
};
