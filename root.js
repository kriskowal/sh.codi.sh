'use strict';

module.exports = Root;

function Root(body, scope) {
}

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    } else if (id === 'modeLine') {
        scope.root.modeLine = component;
    }
};

Root.prototype.hookupThis = function hookupThis(scope) {
    this.root = scope.components.root;
    this.root.parent = this;
    this.modeLine = scope.components.modeLine;
    this.handler = this.root.enter();
    window.addEventListener('keypress', this);
    window.addEventListener('keyup', this);
    window.addEventListener('keydown', this);
};

Root.prototype.handleEvent = function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;

    var prefix = '';
    if (event.type === 'keyup') {
        prefix += 'Up_';
    } else if (event.type === 'keydown') {
        prefix += 'Down_';
    }
    if (event.shiftKey) {
        prefix += 'Shift_';
    }
    if (event.ctrlKey) {
        prefix += 'Ctrl_';
    }
    if (event.altKey) {
        prefix += 'Alt_';
    }
    if (event.metaKey) {
        prefix += 'Meta_';
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

    if (this.handler.handleEvent && this.handler !== this) {
        var next = this.handler.handleEvent(event, key, keyCode);
        if (next) {
            event.preventDefault();
            this.handler = next;
            return;
        }
    }
};

var alias = {
    'Up_Escape': 'Escape',
    'Down_Tab': 'Tab',
    'Down_ArrowLeft': 'ArrowLeft',
    'Down_ArrowRight': 'ArrowRight',
    'Up_Backspace': 'Backspace',
};

Root.prototype.delete = function _delete() {
    return this.root.enter();
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

Root.prototype.toTop = function toTop() {
    return false;
};

Root.prototype.toBottom = function toBottom() {
    return false;
};
