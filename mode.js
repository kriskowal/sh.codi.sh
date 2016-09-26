'use strict';

module.exports = Mode;

function Mode(body, scope) {
    this.Component = scope.argument.component;
    this.componentBody = body.ownerDocument.createBody();
    this.component = new this.Component(this.componentBody, scope);
    this.animator = scope.animator.add(this);
    this.isVisible = false;
    // The element must be conferred by the modeLine.
    // As such, one must use modeLine.show(mode).
    this.element = null;
}

Mode.prototype.transition = function transition() {
    if (this.isVisible) {
        this.element.classList.add('shown');
    } else {
        this.element.classList.remove('shown');
    }
};

Mode.prototype.draw = function draw() {
    // This is a no-op to allow the DOM to ingest a new element before starting
    // a transition.
};

Mode.prototype.show = function show() {
    this.isVisible = true;
    this.animator.requestDraw();
    this.animator.requestTransition();
};

Mode.prototype.hide = function hide() {
    this.isVisible = false;
    this.animator.requestTransition();
};
