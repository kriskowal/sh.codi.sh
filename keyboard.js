'use strict';

module.exports = Keyboard;

function Keyboard(window, handler) {
    this.handler = handler;
    window.addEventListener('keypress', this);
    window.addEventListener('keyup', this);
    window.addEventListener('keydown', this);
}

Keyboard.prototype.take = function take(handler) {
    this.handler = handler;
};

Keyboard.prototype.handleEvent = function handleEvent(event) {
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
