'use strict';

module.exports = Readline;

function Readline(body, scope) {
    this.text = '';
    this.cursor = 0;
}

Readline.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.prefixNode = scope.components.prefix;
        this.cursorNode = scope.components.cursor;
        this.suffixNode = scope.components.suffix;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
    }
};

Readline.prototype.draw = function draw() {
    this.prefixNode.value = this.text.slice(0, this.cursor);
    if (this.cursor === this.text.length) {
        this.cursorNode.value = ' ';
        this.suffixNode.value = '';
    } else {
        this.cursorNode.value = this.text.slice(this.cursor, this.cursor + 1);
        this.suffixNode.value = this.text.slice(this.cursor + 1);
    }
};

// TODO thread read line label:
Readline.prototype.enter = function enter(parent) {
    this.draw();
    this.modeLine.show(this.mode);
    this.parent = parent;
    return this;
};

Readline.prototype.return = function _return(text, cursor) {
    this.modeLine.hide(this.mode);
    return this.parent.returnFromReadline(text, cursor);
};

Readline.prototype.$Tab = function tab() {
    return this;
};

Readline.prototype.$Backspace = function backspace() {
    if (this.cursor > 0) {
        this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
        this.cursor--;
        this.draw();
    }
    return this;
};

Readline.prototype.$Ctrl$KeyB =
Readline.prototype.$ArrowLeft = function arrowLeft() {
    this.cursor = Math.max(0, this.cursor - 1);
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyF =
Readline.prototype.$ArrowRight = function arrowRight() {
    this.cursor = Math.min(text.length, this.cursor + 1);
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyU = function deleteAllBefore() {
    this.text = this.text.slice(this.cursor);
    this.cursor = 0;
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyK = function deleteAllAfter() {
    this.text = this.text.slice(0, this.cursor);
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyA = function gotoBegin() {
    this.cursor = 0;
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyE = function gotoEnd() {
    this.cursor = this.text.length;
    this.draw();
    return this;
};

Readline.prototype.$Ctrl$KeyW = function deletePrevWord() {
    var index = this.cursor - 1;
    while (index >= 0 && this.text[index] === ' ') {
        index--;
    }
    index = this.text.lastIndexOf(' ', index);
    if (index < 0) {
        index = 0;
    } else if (this.text.length > 0) {
        index = index + 1;
    }
    this.text = this.text.slice(0, index) + this.text.slice(this.cursor);
    this.cursor = index;
    this.draw();
    return this;
};

Readline.prototype.$Alt$KeyB = function gotoPrevWord() {
    var index = this.cursor - 1;
    while (index >= 0 && this.text[index] === ' ') {
        index--;
    }
    index = this.text.lastIndexOf(' ', index);
    this.cursor = Math.max(0, this.text.lastIndexOf(' ', index));
    this.draw();
    return this;
};

Readline.prototype.$Alt$KeyF = function gotoNextWord() {
    var index = this.cursor;
    while (index < this.text.length && this.text[index] === ' ') {
        index++;
    }
    index = this.text.indexOf(' ', index);
    if (index < 0) {
        index = this.text.length;
    }
    this.cursor = index;
    this.draw();
    return this;
};

// TODO $Ctrl$KeyV verbatim

Readline.prototype.$Enter = function enter(label) {
    return this.return(this.text, this.cursor);
};

Readline.prototype.$Escape = function enter() {
    return this.return(null, null);
};

// fall through.
Readline.prototype.handleEvent = function handleCommand(event, key, keyCode) {
    if (
        event.type === 'keypress' &&
        key.length === 1 &&
        event.ctrlKey === false &&
        event.altKey === false &&
        event.metaKey === false
    ) {
        this.text = this.text.slice(0, this.cursor) + key + this.text.slice(this.cursor);
        this.cursor += 1;
        this.draw();
        return this;
    }
};
