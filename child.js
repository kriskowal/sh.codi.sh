module.exports = Child;

function Child() {
}

Child.prototype.KeyD = function KeyD() {
    this.blur();
    return this.parent.delete();
};

Child.prototype.KeyJ = function down() {
    if (this.parent.canDown()) {
        this.blur();
        return this.parent.down();
    }
    return this;
};

Child.prototype.KeyK = function up() {
    if (this.parent.canUp()) {
        this.blur();
        return this.parent.up();
    }
    return this;
};

Child.prototype.KeyH = function left() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

Child.prototype.KeyA = function append() {
    if (this.parent.canAppend()) {
        this.blur();
        return this.parent.append();
    }
    return this;
};

Child.prototype.KeyI = function insert() {
    if (this.parent.canInsert()) {
        this.blur();
        return this.parent.insert();
    }
    return this;
};

Child.prototype.Shift_KeyA = function push() {
    if (this.parent.canPush()) {
        this.blur();
        return this.parent.push();
    }
    return this;
};

Child.prototype.Shift_KeyI = function unshift() {
    if (this.parent.canUnshift()) {
        this.blur();
        return this.parent.unshift();
    }
    return this;
};

Child.prototype.KeyG = function toTop() {
    if (this.parent.canToTop()) {
        this.blur();
        return this.parent.toTop();
    }
    return this;
};

Child.prototype.Shift_KeyG = function toBottom() {
    if (this.parent.canToBottom()) {
        this.blur();
        return this.parent.toBottom();
    }
    return this;
};

Child.prototype.Tab = function tab() {
    if (this.parent.canTab()) {
        this.blur();
        return this.parent.tab();
    }
    return this;
};

Child.prototype.Shift_Tab = function tabBack() {
    if (this.parent.canTabBack()) {
        this.blur();
        return this.parent.tabBack();
    }
    return this;
};

Child.prototype.KeyY = function yank() {
    this.scope.clip.set(this.value);
    return this;
};

// Delegate to parent

Child.prototype.canReturn = function canReturn() {
    return this.parent.canReturn();
};

Child.prototype.return = function _return() {
    return this.parent.return();
};

Child.prototype.canDown = function canDown() {
    return this.parent.canDown();
};

Child.prototype.down = function down() {
    return this.parent.down();
};

Child.prototype.canUp = function canUp() {
    return this.parent.canUp();
};

Child.prototype.up = function up() {
    return this.parent.up();
};

Child.prototype.canAppend = function canAppend() {
    return this.parent.canAppend();
};

Child.prototype.append = function append() {
    return this.parent.append();
};

Child.prototype.canInsert = function canInsert() {
    return this.parent.canInsert();
};

Child.prototype.insert = function insert() {
    return this.parent.insert();
};

Child.prototype.canUnshift = function canUnshift() {
    return this.parent.canUnshift();
};

Child.prototype.unshift = function unshift() {
    return this.parent.unshift();
};

Child.prototype.canPush = function canPush() {
    return this.parent.canPush();
};

Child.prototype.push = function push() {
    return this.parent.push();
};

Child.prototype.canToTop = function canToTop() {
    return this.parent.canToTop();
};

Child.prototype.toTop = function toTop() {
    return this.parent.toTop();
};

Child.prototype.canToBottom = function canToBottom() {
    return this.parent.canToBottom();
};

Child.prototype.toBottom = function toBottom() {
    return this.parent.toBottom();
};

Child.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

Child.prototype.tab = function tab(value) {
    return this.parent.tab(value);
};

Child.prototype.delete = function _delete() {
    return this.parent.delete();
};

Child.prototype.canProceed = function canProceed() {
    return this.parent.canProceed();
};

Child.prototype.proceed = function proceed() {
    return this.parent.proceed();
};

// Escape
// Enter
// KeyL
// Ctrl_KeyU
// Ctrl_KeyK
// Backspace
// Delete
// Ctrl_KeyG
// Shift_Ctrl_KeyG
