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

// Escape
// Enter
// KeyL
// Ctrl_KeyU
// Ctrl_KeyK
// Backspace
// Delete
// Ctrl_KeyG
// Shift_Ctrl_KeyG
