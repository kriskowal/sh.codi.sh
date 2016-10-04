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

// Shift_KeyA
// Shift_KeyI
// Ctrl_KeyU
// Ctrl_KeyK
// Backspace
// Delete
// Ctrl_KeyG
// Shift_Ctrl_KeyG
// Enter
// Escape
