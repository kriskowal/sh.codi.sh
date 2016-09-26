'use strict';

module.exports = Main;

function Main(body, scope) {
}

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    } else if (id === 'modeLine') {
        scope.root.modeLine = component;
    }
};

Main.prototype.hookupThis = function hookupThis(scope) {
    this.root = scope.components.root;
    this.handler = this.root.enter(this);
    window.addEventListener('keypress', this);
    window.addEventListener('keyup', this);
    window.addEventListener('keydown', this);
};

Main.prototype.returnFromValue = function returnFromValue() {
    return this.root.enter(this);
};

Main.prototype.handleEvent = function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;

    var prefix = '$';
    if (event.type === 'keyup') {
        prefix += 'Up$';
    } else if (event.type === 'keydown') {
        prefix += 'Down$';
    }
    if (event.shiftKey) {
        prefix += 'Shift$';
    } else if (event.ctrlKey) {
        prefix += 'Ctrl$';
    } else if (event.altKey) {
        prefix += 'Alt$';
    } else if (event.metaKey) {
        prefix += 'Meta$';
    }

    var code = prefix + event.code;

    while (code) {
        if (this.handler[code]) {
            var next = this.handler[code](event);
            if (next === undefined) {
                console.error('invalid handler change, from', this.handler.constructor.name, 'with', code); 
            } else if (next !== null) {
                event.preventDefault();
                this.handler = next;
                return;
            }
        }
        code = alias[code];
    }

    if (this.handler.handleEvent) {
        return this.handler.handleEvent(event, key, keyCode);
    }
};

var alias = {
    '$Up$Escape': '$Escape',
    '$Down$Tab': '$Tab',
    '$Down$ArrowLeft': '$ArrowLeft',
    '$Down$ArrowRight': '$ArrowRgiht',
    '$Up$Backspace': '$Backspace',
};
