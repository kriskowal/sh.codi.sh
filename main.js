'use strict';

module.exports = Main;

function Main() {
}

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'modeLine') {
        scope.root.modeLine = component;
    } else if (id === 'component') {
        this.component = component;
        this.component.parent = this;
    } else if (id === 'representation') {
        this.representation = component;
    }
};

Object.defineProperty(Main.prototype, 'value', {
    get: function getValue() {
        return this.component.value;
    },
    set: function setValue(value) {
        this.component.value = value;
    }
});

Main.prototype.enter = function enter() {
    return this.component.enter();
};

Main.prototype.update = function update() {
    this.representation.value = JSON.stringify(this.component.value.toJSON(), null, 4);
};
