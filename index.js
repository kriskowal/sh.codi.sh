// @generated
/*eslint semi:[0], no-native-reassign:[0]*/
global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["animator.js","blick","animator.js",{"raf":20},function (require, exports, module, __filename, __dirname){

// blick/animator.js
// -----------------

"use strict";

var defaultRequestAnimation = require("raf");

module.exports = Animator;

function Animator(requestAnimation) {
    var self = this;
    self._requestAnimation = requestAnimation || defaultRequestAnimation;
    self.controllers = [];
    // This thunk is doomed to deoptimization for multiple reasons, but passes
    // off as quickly as possible to the unrolled animation loop.
    self._animate = function () {
        try {
            self.animate(Date.now());
        } catch (error) {
            self.requestAnimation();
            throw error;
        }
    };
}

Animator.prototype.requestAnimation = function () {
    if (!this.requested) {
        this._requestAnimation(this._animate);
    }
    this.requested = true;
};

Animator.prototype.animate = function (now) {
    var node, temp;

    this.requested = false;

    // Measure
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.measure) {
            controller.component.measure(now);
            controller.measure = false;
        }
    }

    // Transition
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        // Unlke others, skipped if draw or redraw are scheduled and left on
        // the schedule for the next animation frame.
        if (controller.transition) {
            if (!controller.draw && !controller.redraw) {
                controller.component.transition(now);
                controller.transition = false;
            } else {
                this.requestAnimation();
            }
        }
    }

    // Animate
    // If any components have animation set, continue animation.
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.animate) {
            controller.component.animate(now);
            this.requestAnimation();
            // Unlike others, not reset implicitly.
        }
    }

    // Draw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.draw) {
            controller.component.draw(now);
            controller.draw = false;
        }
    }

    // Redraw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.redraw) {
            controller.component.redraw(now);
            controller.redraw = false;
        }
    }
};

Animator.prototype.add = function (component) {
    var controller = new AnimationController(component, this);
    this.controllers.push(controller);
    return controller;
};

function AnimationController(component, controller) {
    this.component = component;
    this.controller = controller;

    this.measure = false;
    this.transition = false;
    this.animate = false;
    this.draw = false;
    this.redraw = false;
}

AnimationController.prototype.destroy = function () {
};

AnimationController.prototype.requestMeasure = function () {
    if (!this.component.measure) {
        throw new Error("Can't requestMeasure because component does not implement measure");
    }
    this.measure = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelMeasure = function () {
    this.measure = false;
};

AnimationController.prototype.requestTransition = function () {
    if (!this.component.transition) {
        throw new Error("Can't requestTransition because component does not implement transition");
    }
    this.transition = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelTransition = function () {
    this.transition = false;
};

AnimationController.prototype.requestAnimation = function () {
    if (!this.component.animate) {
        throw new Error("Can't requestAnimation because component does not implement animate");
    }
    this.animate = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelAnimation = function () {
    this.animate = false;
};

AnimationController.prototype.requestDraw = function () {
    if (!this.component.draw) {
        throw new Error("Can't requestDraw because component does not implement draw");
    }
    this.draw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelDraw = function () {
    this.draw = false;
};

AnimationController.prototype.requestRedraw = function () {
    if (!this.component.redraw) {
        throw new Error("Can't requestRedraw because component does not implement redraw");
    }
    this.redraw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelRedraw = function () {
    this.redraw = false;
};

}],["choose.html","gutentag","choose.html",{"./choose":2},function (require, exports, module, __filename, __dirname){

// gutentag/choose.html
// --------------------

"use strict";
module.exports = (require)("./choose");

}],["choose.js","gutentag","choose.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/choose.js
// ------------------

"use strict";

module.exports = Choose;
function Choose(body, scope) {
    this.choices = scope.argument.children;
    this.choice = null;
    this.choiceBody = null;
    this.choiceScope = null;
    this.body = body;
    this.scope = scope;
    this._value = null;
}

Object.defineProperty(Choose.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (value != null && !this.choices[value]) {
            throw new Error("Can't switch to non-existant option");
        }

        this._value = value;

        if (this.choice) {
            if (this.choice.destroy) {
                this.choice.destroy();
            }
            this.body.removeChild(this.choiceBody);
            this.choice = null;
            this.choiceBody = null;
        }

        if (value != null) {
            this.choiceBody = this.body.ownerDocument.createBody();
            this.choiceScope = this.scope.nestComponents();
            this.choice = new this.choices[value](this.choiceBody, this.choiceScope);
            this.choiceScope.hookup(this.scope.id + ":" + value, this.choice);
            this.body.appendChild(this.choiceBody);
        }
    }
});

Choose.prototype.destroy = function () {
    for (var name in this.options) {
        var child = this.options[name];
        if (child.destroy) {
            child.destroy();
        }
    }
};

}],["document.js","gutentag","document.js",{"koerper":11},function (require, exports, module, __filename, __dirname){

// gutentag/document.js
// --------------------

"use strict";
module.exports = require("koerper");

}],["repeat.html","gutentag","repeat.html",{"./repeat":5},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.html
// --------------------

"use strict";
module.exports = (require)("./repeat");

}],["repeat.js","gutentag","repeat.js",{"pop-observe":13,"pop-swap":18},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.js
// ------------------


var O = require("pop-observe");
var swap = require("pop-swap");

var empty = [];

module.exports = Repetition;
function Repetition(body, scope) {
    this.body = body;
    this.scope = scope;
    this.iterations = [];
    this.Iteration = scope.argument.component;
    this.id = scope.id;
    this.observer = null;
    this._value = null;
    this.value = [];
}

Object.defineProperty(Repetition.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (!Array.isArray(value)) {
            throw new Error('Value of repetition must be an array');
        }
        if (this.observer) {
            this.observer.cancel();
            this.handleValueRangeChange(empty, this._value, 0);
        }
        this._value = value;
        this.handleValueRangeChange(this._value, empty, 0);
        this.observer = O.observeRangeChange(this._value, this, "value");
    }
});

Repetition.prototype.handleValueRangeChange = function (plus, minus, index) {
    var body = this.body;
    var document = this.body.ownerDocument;

    for (var offset = index; offset < index + minus.length; offset++) {
        var iteration = this.iterations[offset];
        body.removeChild(iteration.body);
        iteration.value = null;
        iteration.index = null;
        iteration.body = null;
        if (iteration.destroy) {
            iteration.destroy();
        }
    }

    var nextIteration = this.iterations[index];
    var nextSibling = nextIteration && nextIteration.body;

    var add = [];
    for (var offset = 0; offset < plus.length; offset++) {
        var value = plus[offset];
        var iterationNode = document.createBody();
        var iterationScope = this.scope.nestComponents();

        var iteration = new this.Iteration(iterationNode, iterationScope);

        iteration.value = value;
        iteration.index = index + offset;
        iteration.body = iterationNode;

        iterationScope.hookup(this.scope.id + ":iteration", iteration);

        body.insertBefore(iterationNode, nextSibling);
        add.push(iteration);
    }

    swap(this.iterations, index, minus.length, add);

    // Update indexes
    for (var offset = index; offset < this.iterations.length; offset++) {
        this.iterations[offset].index = offset;
    }
};

Repetition.prototype.redraw = function (region) {
    for (var index = 0; index < this.iterations.length; index++) {
        var iteration = this.iterations[index];
        iteration.redraw(region);
    }
};

Repetition.prototype.destroy = function () {
    this.observer.cancel();
    this.handleValuesRangeChange([], this._value, 0);
};


}],["reveal.html","gutentag","reveal.html",{"./reveal":7},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.html
// --------------------

"use strict";
module.exports = (require)("./reveal");

}],["reveal.js","gutentag","reveal.js",{"pop-observe":13},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.js
// ------------------

"use strict";

// TODO create scope for revealed body and add to owner whenever it is created.
// Destroy when retracted, recreate when revealed.

var O = require("pop-observe");

module.exports = Reveal;
function Reveal(body, scope) {
    this.value = false;
    this.observer = O.observePropertyChange(this, "value", this);
    this.body = body;
    this.scope = scope;
    this.Component = scope.argument.component;
    this.component = null;
    this.componentBody = null;
    this.componentScope = null;
}

Reveal.prototype.handleValuePropertyChange = function (value) {
    this.clear();
    if (value) {
        this.componentScope = this.scope.nestComponents();
        this.componentBody = this.body.ownerDocument.createBody();
        this.component = new this.Component(this.componentBody, this.componentScope);
        this.componentScope.hookup(this.scope.id + ":revelation", this.component);
        this.body.appendChild(this.componentBody);
    }
};

Reveal.prototype.clear = function clear() {
    if (this.component) {
        if (this.component.destroy) {
            this.component.destroy();
        }
        this.body.removeChild(this.componentBody);
        this.component = null;
        this.componentBody = null;
    }
};

Reveal.prototype.destroy = function () {
    this.clear();
    this.observer.cancel();
};

}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["text.html","gutentag","text.html",{"./text":10},function (require, exports, module, __filename, __dirname){

// gutentag/text.html
// ------------------

"use strict";
module.exports = (require)("./text");

}],["text.js","gutentag","text.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/text.js
// ----------------

"use strict";

module.exports = Text;
function Text(body, scope) {
    var node = body.ownerDocument.createTextNode("");
    body.appendChild(node);
    this.node = node;
    this.defaultText = scope.argument.innerText;
    this._value = null;
}

Object.defineProperty(Text.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        this._value = value;
        if (value == null) {
            this.node.data = this.defaultText;
        } else {
            this.node.data = "" + value;
        }
    }
});

}],["koerper.js","koerper","koerper.js",{"wizdom":54},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["lib/performance-now.js","performance-now/lib","performance-now.js",{},function (require, exports, module, __filename, __dirname){

// performance-now/lib/performance-now.js
// --------------------------------------

// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}],["index.js","pop-observe","index.js",{"./observable-array":14,"./observable-object":16,"./observable-range":17,"./observable-map":15},function (require, exports, module, __filename, __dirname){

// pop-observe/index.js
// --------------------

"use strict";

require("./observable-array");
var Oa = require("./observable-array");
var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

exports.makeArrayObservable = Oa.makeArrayObservable;

for (var name in Oo) {
    exports[name] = Oo[name];
}
for (var name in Or) {
    exports[name] = Or[name];
}
for (var name in Om) {
    exports[name] = Om[name];
}


}],["observable-array.js","pop-observe","observable-array.js",{"./observable-object":16,"./observable-range":17,"./observable-map":15,"pop-swap/swap":19},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-array.js
// -------------------------------

/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 *
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

var array_swap = require("pop-swap/swap");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                Oo.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            Or.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            Oo.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        Om.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                                Om.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                Om.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            Or.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                Oo.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

exports.makeArrayObservable = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
exports.makeRangeChangesObservable = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
exports.makeMapChangesObservable = makeMapChangesObservable;
function makeMapChangesObservable(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}


}],["observable-map.js","pop-observe","observable-map.js",{"./observable-array":14},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-map.js
// -----------------------------

"use strict";

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function getMapWillChangeObservers(object) {
    return getMapChangeObservers(object, true);
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var Oa = require("./observable-array");

}],["observable-object.js","pop-observe","observable-object.js",{"./observable-array":14},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-object.js
// --------------------------------

/*jshint node: true*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

module.exports = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) { // TODO && !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable(object, name) {
    if (Array.isArray(object)) {
        return Oa.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

var Oa = require("./observable-array");

}],["observable-range.js","pop-observe","observable-range.js",{"./observable-array":14},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-range.js
// -------------------------------

/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList.clear) {
                observerToFreeList.clear();
            } else {
                observerToFreeList.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

var Oa = require("./observable-array");

}],["pop-swap.js","pop-swap","pop-swap.js",{"./swap":19},function (require, exports, module, __filename, __dirname){

// pop-swap/pop-swap.js
// --------------------

"use strict";

var swap = require("./swap");

module.exports = polymorphicSwap;
function polymorphicSwap(array, start, minusLength, plus) {
    if (typeof array.swap === "function") {
        array.swap(start, minusLength, plus);
    } else {
        swap(array, start, minusLength, plus);
    }
}


}],["swap.js","pop-swap","swap.js",{},function (require, exports, module, __filename, __dirname){

// pop-swap/swap.js
// ----------------

"use strict";

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice = Array.prototype.slice;

module.exports = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}


}],["index.js","raf","index.js",{"performance-now":12},function (require, exports, module, __filename, __dirname){

// raf/index.js
// ------------

var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

}],["array.js","sh.codi.sh","array.js",{"./model":35,"./child":25},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/array.js
// -------------------

'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = ArrayView;

// TODO focus empty element if empty

function ArrayView() {
    this.cursor = 0;
    this._value = new model.Cell([], model.array);
    this.parent = null;
}

ArrayView.prototype = Object.create(Child.prototype);
ArrayView.prototype.constructor = ArrayView;

ArrayView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.emptyMode = scope.components.emptyMode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        scope.components.element.parent = this;
        scope.components.element.value = component.value;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    }
};

Object.defineProperty(ArrayView.prototype, 'value', {
    get: function getValue() {
        var value = [];
        for (var i = 0; i < this.elements.value.length; i++) {
            value.push(this.get(i));
        }
        return new model.Cell(value, this._value.model);
    },
    set: function setValue(cell) {
        var value = cell.value;
        if (value == null) {
            this.elements.value.clear();
            return;
        }
        this.elements.value = cell.value.slice();
        this._value.model = cell.model;
        this.resize();
    }
});

ArrayView.prototype.createChild = function createChild(index) {
    return new model.Cell(null, this.value.model.get(index));
};

ArrayView.prototype.swap = function swap(index, minus, plus) {
    var array = [];
    for (var i = 0; i < plus; i++) {
        array.push(this.createChild(index + i));
    }
    this.elements.value.swap(this.cursor, minus, array);
    this.parent.update();
    this.resize();
};

ArrayView.prototype.get = function get(index) {
    return this.elements.iterations[index].scope.components.element.value;
};

ArrayView.prototype.update = function update(value) {
    this._value.value[this.cursor] = value;
    this.parent.update(this.value);
};

ArrayView.prototype.enter = function enter() {
    if (this.cursor < this.elements.value.length) {
        return this.reenterChildAt(this.cursor);
    } else {
        return this.enterEmptyMode();
    }
};

ArrayView.prototype.enterChild = function enterChild() {
    if (this.cursor < this.elements.value.length) {
        return this.enterChildAt(this.cursor);
    } else {
        return this.enterEmptyMode();
    }
};

ArrayView.prototype.reenterChildAt = function reenterChildAt(index) {
    return this.elements.iterations[index].scope.components.element.reenter();
};

ArrayView.prototype.enterChildAt = function enterChildAt(index) {
    return this.elements.iterations[index].scope.components.element.enter();
};

ArrayView.prototype.enterEmptyMode = function enterEmptyMode() {
    this.focusEmpty();
    return new Empty(this);
};

ArrayView.prototype.blurEmpty = function blurEmpty() {
    this.modeLine.hide(this.emptyMode);
    this.emptyElement.classList.remove('active');
};

ArrayView.prototype.focusEmpty = function focusEmpty() {
    this.modeLine.show(this.emptyMode);
    this.emptyElement.classList.add('active');
};

ArrayView.prototype.exit = function () {
    this.blur();
    return this.parent.return();
};

ArrayView.prototype.resize = function resize() {
    this.ifEmpty.value = this.elements.value.length === 0;
};

ArrayView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.parent.focusChild();
};

ArrayView.prototype.blur = function hide() {
    this.modeLine.hide(this.mode);
    this.parent.blurChild();
};

ArrayView.prototype.canPush = function canPush() {
    return true;
};

ArrayView.prototype.push = function push() {
    this.blurEmpty();
    this.cursor = this.elements.value.length;
    this.swap(this.elements.value.length, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canUnshift = function canUnshift() {
    return true;
};

ArrayView.prototype.unshift = function unshift() {
    this.blurEmpty();
    this.cursor = 0;
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canAppend = function canAppend() {
    return true;
};

ArrayView.prototype.append = function append() {
    if (this.elements.value.length === 0) {
        return this.push();
    }
    this.cursor++;
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canInsert = function canInsert() {
    return true;
};

ArrayView.prototype.insert = function insert() {
    this.swap(this.cursor, 0, 1);
    return this.enterChild();
};

ArrayView.prototype.canReenter = function canReenter() {
    return true;
};

ArrayView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

ArrayView.prototype.canUp = function canUp() {
    return true;
};

ArrayView.prototype.up = function up() {
    if (this.cursor === 0) {
        // TODO consider up navigation
        return this.enter();
    }
    this.cursor--;
    return this.enter();
};

ArrayView.prototype.canDown = function canDown() {
    return true;
};

ArrayView.prototype.down = function down() {
    if (this.cursor + 1 === this.elements.value.length) {
        // TODO consider up navigation
        return this.enter();
    }
    this.cursor++;
    return this.enter();
};

ArrayView.prototype.canToTop = function canToTop() {
    return true;
};

ArrayView.prototype.toTop = function toTop() {
    this.cursor = 0;
    return this.enter();
};

ArrayView.prototype.canToBottom = function canToBottom() {
    return true;
};

ArrayView.prototype.toBottom = function toBottom() {
    this.cursor = Math.max(0, this.elements.value.length - 1);
    return this.enter();
};

ArrayView.prototype.delete = function _delete() {
    this.swap(this.cursor, 1, 0);
    if (this.cursor > 0 && this.cursor >= this.elements.value.length) {
        this.cursor--;
    }
    return this.enter();
};

ArrayView.prototype.canReturn = function canReturn() {
    return true;
};

ArrayView.prototype.return = function _return() {
    this.focus();
    return this;
};

ArrayView.prototype.KeyL =
ArrayView.prototype.Enter = function enter() {
    this.blur();
    return this.enter();
};

ArrayView.prototype.canTab = function canTab() {
    return true;
};

ArrayView.prototype.tab = function tab() {
    return this.append();
};

ArrayView.prototype.canTabBack = function canTabBack() {
    return false; // TODO
};

ArrayView.prototype.canProceed = function canProceed() {
    return false;
};

function Empty(parent) {
    this.parent = parent;
}

Empty.prototype = Object.create(Child.prototype);
Empty.prototype.constructor = Empty;

Empty.prototype.blur = function blur() {
    this.parent.blurEmpty();
};

Empty.prototype.Enter =
Empty.prototype.KeyA = function append() {
    this.blur();
    return this.parent.push();
};

Empty.prototype.KeyI = function insert() {
    this.blur();
    return this.parent.unshift();
};

}],["array.xml","sh.codi.sh","array.xml",{"./array":21,"gutentag/repeat.html":4,"gutentag/reveal.html":6,"./value.html":52,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/array.xml
// --------------------

"use strict";
var $SUPER = require("./array");
module.exports = ShcodishArray;
function ShcodishArray(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV 
    node = document.createElement("div");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "arrayBox");
    }
    // /DIV 
    parents[parents.length] = parent; parent = node;
    // div
        // TABLE elementsBox
        node = document.createElement("table");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("elementsBox", component);
        if (component.setAttribute) {
            component.setAttribute("id", "elementsBox_yb0ui0");
        }
        if (scope.componentsFor["elementsBox"]) {
            scope.componentsFor["elementsBox"].setAttribute("for", "elementsBox_yb0ui0")
        }
        // /TABLE elementsBox
        parents[parents.length] = parent; parent = node;
        // table
            // REVEAL ifEmpty
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // reveal
                node = {tagName: "reveal"};
                node.component = $THIS$0;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "ifEmpty";
                component = new $REVEAL(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("ifEmpty", component);
            if (component.setAttribute) {
                component.setAttribute("id", "ifEmpty_sqg30s");
            }
            if (scope.componentsFor["ifEmpty"]) {
                scope.componentsFor["ifEmpty"].setAttribute("for", "ifEmpty_sqg30s")
            }
            // /REVEAL ifEmpty
            // REPEAT elements
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // repeat
                node = {tagName: "repeat"};
                node.component = $THIS$1;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "elements";
                component = new $REPEAT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("elements", component);
            if (component.setAttribute) {
                component.setAttribute("id", "elements_1y4vef");
            }
            if (scope.componentsFor["elements"]) {
                scope.componentsFor["elements"].setAttribute("for", "elements_1y4vef")
            }
            // /REPEAT elements
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$3;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_bcvkk6");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_bcvkk6")
    }
    // /MODE mode
    // MODE emptyMode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$5;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "emptyMode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("emptyMode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "emptyMode_sc7yv1");
    }
    if (scope.componentsFor["emptyMode"]) {
        scope.componentsFor["emptyMode"].setAttribute("for", "emptyMode_sc7yv1")
    }
    // /MODE emptyMode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishArray
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $REPEAT = require("gutentag/repeat.html");
var $REVEAL = require("gutentag/reveal.html");
var $VALUE = require("./value.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishArray$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TD 
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        // /TD 
        parents[parents.length] = parent; parent = node;
        // td
            // DIV emptyElement
            node = document.createElement("div");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("emptyElement", component);
            if (component.setAttribute) {
                component.setAttribute("id", "emptyElement_3h4htq");
            }
            if (scope.componentsFor["emptyElement"]) {
                scope.componentsFor["emptyElement"].setAttribute("for", "emptyElement_3h4htq")
            }
            if (component.setAttribute) {
                component.setAttribute("class", "element");
            }
            // /DIV emptyElement
            parents[parents.length] = parent; parent = node;
            // div
                // EM 
                node = document.createElement("em");
                parent.appendChild(node);
                component = node.actualNode;
                // /EM 
                parents[parents.length] = parent; parent = node;
                // em
                    parent.appendChild(document.createTextNode("empty array"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishArray$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TD 
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        // /TD 
        parents[parents.length] = parent; parent = node;
        // td
            // VALUE element
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // value
                node = {tagName: "value"};
                node.component = $THIS$1$2;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "element";
                component = new $VALUE(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("element", component);
            if (component.setAttribute) {
                component.setAttribute("id", "element_ptnmqt");
            }
            if (scope.componentsFor["element"]) {
                scope.componentsFor["element"].setAttribute("for", "element_ptnmqt")
            }
            // /VALUE element
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1$2 = function ShcodishArray$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("array:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⎋"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("hjkl"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" move"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("dd"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("i"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("nsert"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ppend"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("pre-⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("i"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("nsert"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("elete"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to first"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to last"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$3 = function ShcodishArray$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("array:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // argument
        node = {tagName: "argument"};
        node.component = $THIS$3$4;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT 
};
var $THIS$3$4 = function ShcodishArray$3$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$5 = function ShcodishArray$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("array:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" append"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("i"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" prepend"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // argument
        node = {tagName: "argument"};
        node.component = $THIS$5$6;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT 
};
var $THIS$5$6 = function ShcodishArray$5$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["boolean.html","sh.codi.sh","boolean.html",{"./boolean":24,"gutentag/choose.html":1,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/boolean.html
// -----------------------

"use strict";
var $SUPER = require("./boolean");
module.exports = ShcodishBoolean;
function ShcodishBoolean(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // CHOOSE choose
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // CHOOSE
        node = {tagName: "choose"};
        node.children = {};
        node.children["true"] = $THIS$0;
        node.children["false"] = $THIS$1;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "choose";
        component = new $CHOOSE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("choose", component);
    if (component.setAttribute) {
        component.setAttribute("id", "choose_p8mul0");
    }
    if (scope.componentsFor["choose"]) {
        scope.componentsFor["choose"].setAttribute("for", "choose_p8mul0")
    }
    // /CHOOSE choose
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$2;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_5u8t1z");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_5u8t1z")
    }
    // /MODE mode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishBoolean
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $CHOOSE = require("gutentag/choose.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishBoolean$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // EM null
    node = document.createElement("EM");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "number");
    }
    // /EM null
    parents[parents.length] = parent; parent = node;
    // EM
        parent.appendChild(document.createTextNode("true"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishBoolean$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // EM null
    node = document.createElement("EM");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "number");
    }
    // /EM null
    parents[parents.length] = parent; parent = node;
    // EM
        parent.appendChild(document.createTextNode("false"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$2 = function ShcodishBoolean$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("boolean:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("t"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rue"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("f"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("alse"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("n"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("egate "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("!"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("l"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("h"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⎋"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARGUMENT
        node = {tagName: "argument"};
        node.component = $THIS$2$3;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT null
};
var $THIS$2$3 = function ShcodishBoolean$2$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["boolean.js","sh.codi.sh","boolean.js",{"./model":35,"./child":25},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/boolean.js
// ---------------------

'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = BooleanView;

function BooleanView() {
    this._value = new model.Cell(false, model.boolean);
    this.parent = null;
}

BooleanView.prototype = Object.create(Child.prototype);
BooleanView.prototype.constructor = BooleanView;

BooleanView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.modeLine = scope.modeLine;
        this.mode = scope.components.mode;
        this.choose = scope.components.choose;
    }
};

Object.defineProperty(BooleanView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

BooleanView.prototype.draw = function draw() {
    this.choose.value = this._value.value ? 'true' : 'false';
};

BooleanView.prototype.enter = function enter() {
    this.focus();
    return this;
};

BooleanView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

BooleanView.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.parent.focusChild();
};

BooleanView.prototype.blur = function blur() {
    this.modeLine.hide(this.mode);
    this.parent.blurChild();
};

BooleanView.prototype.KeyT = function _true() {
    this.value.value = true;
    this.parent.update(this.value);
    this.draw();
    return this;
};

BooleanView.prototype.KeyF = function _false() {
    this.value.value = false;
    this.parent.update(this.value);
    this.draw();
    return this;
};

BooleanView.prototype.Shift_Digit1 =
BooleanView.prototype.Space =
BooleanView.prototype.KeyN = function negate() {
    this.value.value = !this.value.value;
    this.parent.update(this.value);
    this.draw();
    return this;
};

}],["child.js","sh.codi.sh","child.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/child.js
// -------------------

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

}],["clip.js","sh.codi.sh","clip.js",{"./model":35},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/clip.js
// ------------------

'use strict';

var model = require('./model');

module.exports = Clip;

function Clip() {
    this.value = new model.Cell(null, model.any);
}

Clip.prototype.get = function get() {
    return this.value;
};

Clip.prototype.set = function set(value) {
    this.value = value;
};

}],["index.js","sh.codi.sh","index.js",{"gutentag/document":3,"gutentag/scope":8,"blick":0,"./keyboard":28,"./main.html":29,"./model":35},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/index.js
// -------------------

'use strict';
var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var Animator = require('blick');
var Keyboard = require('./keyboard');
var Main = require('./main.html');
var model = require('./model');
var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.main = new Main(document.documentElement, scope);
scope.main.value = new model.Cell(null, model.any);
scope.keyboard = new Keyboard(window, scope.main.enter());

}],["keyboard.js","sh.codi.sh","keyboard.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/keyboard.js
// ----------------------

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

}],["main.html","sh.codi.sh","main.html",{"./main":30,"gutentag/text.html":9,"./root.html":42,"./modeline.html":36},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/main.html
// --------------------

"use strict";
var $SUPER = require("./main");
module.exports = ShcodishMain;
function ShcodishMain(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // MODELINE modeLine
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODELINE
        node = {tagName: "modeline"};
        node.component = $THIS$0;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "modeLine";
        component = new $MODELINE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("modeLine", component);
    if (component.setAttribute) {
        component.setAttribute("id", "modeLine_681pml");
    }
    if (scope.componentsFor["modeLine"]) {
        scope.componentsFor["modeLine"].setAttribute("for", "modeLine_681pml")
    }
    // /MODELINE modeLine
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "nonModeLine");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "left");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
            // ROOT component
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // ROOT
                node = {tagName: "root"};
                node.component = $THIS$1;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "component";
                component = new $ROOT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("component", component);
            if (component.setAttribute) {
                component.setAttribute("id", "component_56dybd");
            }
            if (scope.componentsFor["component"]) {
                scope.componentsFor["component"].setAttribute("for", "component_56dybd")
            }
            // /ROOT component
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "right");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
            // PRE null
            node = document.createElement("PRE");
            parent.appendChild(node);
            component = node.actualNode;
            // /PRE null
            parents[parents.length] = parent; parent = node;
            // PRE
                // TEXT representation
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // TEXT
                    node = {tagName: "text"};
                    node.innerText = "";
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "representation";
                    component = new $TEXT(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("representation", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "representation_umepd6");
                }
                if (scope.componentsFor["representation"]) {
                    scope.componentsFor["representation"].setAttribute("for", "representation_umepd6")
                }
                // /TEXT representation
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = ShcodishMain
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TEXT = require("gutentag/text.html");
var $ROOT = require("./root.html");
var $MODELINE = require("./modeline.html");
var $THIS$0 = function ShcodishMain$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$1 = function ShcodishMain$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["main.js","sh.codi.sh","main.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/main.js
// ------------------

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

}],["map.js","sh.codi.sh","map.js",{"./model":35,"./array":21},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/map.js
// -----------------

'use strict';

var model = require('./model');
var ArrayView = require('./array');

module.exports = MapView;

function MapView() {
    this.cursor = 0;
    this.index = {};
    this._value = new model.Cell([], model.any);
    this.parent = null;
}

MapView.prototype = Object.create(ArrayView.prototype);
MapView.prototype.constructor = MapView;

MapView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.emptyMode = scope.components.emptyMode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        this.index['$' + component.value.key] = component;
        scope.components.key.value = component.value.key;
        scope.components.key.parent = this;
        scope.components.value.value = component.value.value;
        scope.components.value.parent = this;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    }
};

MapView.prototype.canProceed = function canProceed() {
    return true;
};

MapView.prototype.proceed = function proceed() {
    return this.elements.iterations[this.cursor].scope.components.value.enter();
};

MapView.prototype.createChild = function createChild(index) {
    return new Entry(
        new model.Cell(null, this.value.model.key),
        new model.Cell(null, this.value.model.value)
    );
};

MapView.prototype.get = function get(index) {
    var key = this.elements.iterations[index].scope.components.key.value;
    var value = this.elements.iterations[index].scope.components.value.value;
    return new Entry(key, value);
};

MapView.prototype.enterChildAt = function enterChildAt(index) {
    return this.elements.iterations[index].scope.components.key.enter();
};

MapView.prototype.reenterChildAt = function reenterChildAt(index) {
    return this.elements.iterations[index].scope.components.value.reenter();
};

function Entry(key, value) {
    this.key = key;
    this.value = value;
}

}],["map.xml","sh.codi.sh","map.xml",{"./map":31,"gutentag/repeat.html":4,"gutentag/reveal.html":6,"./value.html":52,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/map.xml
// ------------------

"use strict";
var $SUPER = require("./map");
module.exports = ShcodishMap;
function ShcodishMap(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV 
    node = document.createElement("div");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "mapBox");
    }
    // /DIV 
    parents[parents.length] = parent; parent = node;
    // div
        // TABLE 
        node = document.createElement("table");
        parent.appendChild(node);
        component = node.actualNode;
        // /TABLE 
        parents[parents.length] = parent; parent = node;
        // table
            // TR 
            node = document.createElement("tr");
            parent.appendChild(node);
            component = node.actualNode;
            // /TR 
            parents[parents.length] = parent; parent = node;
            // tr
                // TH 
                node = document.createElement("th");
                parent.appendChild(node);
                component = node.actualNode;
                if (component.setAttribute) {
                    component.setAttribute("class", "keyHeader");
                }
                // /TH 
                parents[parents.length] = parent; parent = node;
                // th
                    // SPAN 
                    node = document.createElement("span");
                    parent.appendChild(node);
                    component = node.actualNode;
                    if (component.setAttribute) {
                        component.setAttribute("class", "element");
                    }
                    // /SPAN 
                    parents[parents.length] = parent; parent = node;
                    // span
                        // EM 
                        node = document.createElement("em");
                        parent.appendChild(node);
                        component = node.actualNode;
                        // /EM 
                        parents[parents.length] = parent; parent = node;
                        // em
                            parent.appendChild(document.createTextNode("key"));
                        node = parent; parent = parents[parents.length - 1]; parents.length--;
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                // TH 
                node = document.createElement("th");
                parent.appendChild(node);
                component = node.actualNode;
                if (component.setAttribute) {
                    component.setAttribute("class", "valueHeader");
                }
                // /TH 
                parents[parents.length] = parent; parent = node;
                // th
                    // SPAN 
                    node = document.createElement("span");
                    parent.appendChild(node);
                    component = node.actualNode;
                    if (component.setAttribute) {
                        component.setAttribute("class", "element");
                    }
                    // /SPAN 
                    parents[parents.length] = parent; parent = node;
                    // span
                        // EM 
                        node = document.createElement("em");
                        parent.appendChild(node);
                        component = node.actualNode;
                        // /EM 
                        parents[parents.length] = parent; parent = node;
                        // em
                            parent.appendChild(document.createTextNode("value"));
                        node = parent; parent = parents[parents.length - 1]; parents.length--;
                    node = parent; parent = parents[parents.length - 1]; parents.length--;
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            // REVEAL ifEmpty
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // reveal
                node = {tagName: "reveal"};
                node.component = $THIS$0;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "ifEmpty";
                component = new $REVEAL(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("ifEmpty", component);
            if (component.setAttribute) {
                component.setAttribute("id", "ifEmpty_8h805z");
            }
            if (scope.componentsFor["ifEmpty"]) {
                scope.componentsFor["ifEmpty"].setAttribute("for", "ifEmpty_8h805z")
            }
            // /REVEAL ifEmpty
            // REPEAT elements
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // repeat
                node = {tagName: "repeat"};
                node.component = $THIS$1;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "elements";
                component = new $REPEAT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("elements", component);
            if (component.setAttribute) {
                component.setAttribute("id", "elements_52if4p");
            }
            if (scope.componentsFor["elements"]) {
                scope.componentsFor["elements"].setAttribute("for", "elements_52if4p")
            }
            // /REPEAT elements
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$4;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_xxd26j");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_xxd26j")
    }
    // /MODE mode
    // MODE emptyMode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$6;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "emptyMode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("emptyMode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "emptyMode_u46ix9");
    }
    if (scope.componentsFor["emptyMode"]) {
        scope.componentsFor["emptyMode"].setAttribute("for", "emptyMode_u46ix9")
    }
    // /MODE emptyMode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishMap
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $REPEAT = require("gutentag/repeat.html");
var $REVEAL = require("gutentag/reveal.html");
var $VALUE = require("./value.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishMap$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TD 
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("colspan", "2");
        }
        if (component.setAttribute) {
            component.setAttribute("class", "emptyRow");
        }
        // /TD 
        parents[parents.length] = parent; parent = node;
        // td
            // SPAN emptyElement
            node = document.createElement("span");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("emptyElement", component);
            if (component.setAttribute) {
                component.setAttribute("class", "element");
            }
            if (component.setAttribute) {
                component.setAttribute("id", "emptyElement_8qzpk8");
            }
            if (scope.componentsFor["emptyElement"]) {
                scope.componentsFor["emptyElement"].setAttribute("for", "emptyElement_8qzpk8")
            }
            // /SPAN emptyElement
            parents[parents.length] = parent; parent = node;
            // span
                // EM 
                node = document.createElement("em");
                parent.appendChild(node);
                component = node.actualNode;
                // /EM 
                parents[parents.length] = parent; parent = node;
                // em
                    parent.appendChild(document.createTextNode("no entries"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishMap$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TH keyBox
        node = document.createElement("th");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("keyBox", component);
        if (component.setAttribute) {
            component.setAttribute("id", "keyBox_u6c6cd");
        }
        if (scope.componentsFor["keyBox"]) {
            scope.componentsFor["keyBox"].setAttribute("for", "keyBox_u6c6cd")
        }
        // /TH keyBox
        parents[parents.length] = parent; parent = node;
        // th
            // VALUE key
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // value
                node = {tagName: "value"};
                node.component = $THIS$1$2;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "key";
                component = new $VALUE(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("key", component);
            if (component.setAttribute) {
                component.setAttribute("id", "key_d2mf2f");
            }
            if (scope.componentsFor["key"]) {
                scope.componentsFor["key"].setAttribute("for", "key_d2mf2f")
            }
            // /VALUE key
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // TD valueBox
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("valueBox", component);
        if (component.setAttribute) {
            component.setAttribute("id", "valueBox_mlrjfi");
        }
        if (scope.componentsFor["valueBox"]) {
            scope.componentsFor["valueBox"].setAttribute("for", "valueBox_mlrjfi")
        }
        if (component.setAttribute) {
            component.setAttribute("class", "valueBox");
        }
        // /TD valueBox
        parents[parents.length] = parent; parent = node;
        // td
            // VALUE value
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // value
                node = {tagName: "value"};
                node.component = $THIS$1$3;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "value";
                component = new $VALUE(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("value", component);
            if (component.setAttribute) {
                component.setAttribute("id", "value_eqwfqv");
            }
            if (scope.componentsFor["value"]) {
                scope.componentsFor["value"].setAttribute("for", "value_eqwfqv")
            }
            // /VALUE value
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1$2 = function ShcodishMap$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("map:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("hjkl"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" move"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("dd"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("elete"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to first"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to last"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$1$3 = function ShcodishMap$1$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("map:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("hjkl"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" move"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("dd"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("elete"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to first"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to last"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$4 = function ShcodishMap$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("map:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // argument
        node = {tagName: "argument"};
        node.component = $THIS$4$5;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT 
};
var $THIS$4$5 = function ShcodishMap$4$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$6 = function ShcodishMap$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("map:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" append"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("i"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" prepend"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // argument
        node = {tagName: "argument"};
        node.component = $THIS$6$7;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT 
};
var $THIS$6$7 = function ShcodishMap$6$7(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["mode.html","sh.codi.sh","mode.html",{"./mode":34},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/mode.html
// --------------------

"use strict";
module.exports = (require)("./mode");

}],["mode.js","sh.codi.sh","mode.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/mode.js
// ------------------

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
    if (!this.element) {
        return;
    }
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

}],["model.js","sh.codi.sh","model.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/model.js
// -------------------

'use strict';

exports.Cell = Cell;
function Cell(value, model) {
    this.value = value;
    this.model = model;
}

Cell.prototype.toJSON = function toJSON() {
    return this.model.toJSON(this.value);
};

function AnyModel() {
    this.type = 'any';
    this.view = 'any';
}
exports.any = new AnyModel();
AnyModel.prototype.toJSON = function toJSON(cell) {
    if (cell != null) {
        return cell.toJSON();
    }
    return null;
};

exports.String = StringModel;
function StringModel() {
    this.type = 'string';
    this.view = 'string';
    this.range = [];
}
exports.string = new StringModel();
StringModel.prototype.toJSON = function toJSON(value) {
    return value;
};

exports.Number = NumberModel;
function NumberModel() {
    this.type = 'number';
    this.view = 'number';
    this.min = -Infinity;
    this.max = +Infinity;
}
NumberModel.prototype.toJSON = function toJSON(value) {
    return value;
};
exports.number = new NumberModel();

function BooleanModel() {
    this.type = 'boolean';
    this.view = 'boolean';
}
BooleanModel.prototype.toJSON = function toJSON(value) {
    return value;
};
exports.boolean = new BooleanModel();

exports.Array = ArrayModel;
function ArrayModel(value) {
    this.type = 'array';
    this.view = 'array';
    this.value = value || exports.any;
    this.minLength = 0;
    this.maxLength = Infinity;
}
ArrayModel.prototype.toJSON = function toJSON(value) {
    var json = [];
    for (var i = 0; i < value.length; i++) {
        var cell = value[i];
        json.push(cell.toJSON());
    }
    return json;
};
exports.array = new ArrayModel();

ArrayModel.prototype.get = function get(array, index) {
    return this.value;
};

exports.Object = ObjectModel;
function ObjectModel(value) {
    this.type = 'object';
    this.view = 'map';
    this.key = exports.string;
    this.value = value || exports.any;
}
ObjectModel.prototype.toJSON = function toJSON(entries) {
    var json = {};
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var key = entry.key.toJSON();
        var value = entry.value.toJSON();
        json[key] = value;
    }
    return json;
};
ObjectModel.prototype.get = function get(index) {
    return this;
};

exports.Map = MapModel;
function MapModel(key, value) {
    this.type = 'map';
    this.view = 'map';
    this.key = key;
    this.value = value;
}
MapModel.prototype.toJSON = function toJSON(entries) {
    var json = [];
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var key = entry.key.toJSON();
        var value = entry.value.toJSON();
        json.push([key, value]);
    }
    return json;
};
MapModel.prototype.get = function get(index) {
    return this;
};

// TODO Enum
// TODO Tuple
// TODO Struct
// TODO Union
// TODO Result

}],["modeline.html","sh.codi.sh","modeline.html",{"./modeline":37,"gutentag/repeat.html":4,"./slot.html":44},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/modeline.html
// ------------------------

"use strict";
var $SUPER = require("./modeline");
module.exports = ShcodishModeline;
function ShcodishModeline(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV modeLine
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("modeLine", component);
    if (component.setAttribute) {
        component.setAttribute("class", "modeLine");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "modeLine_seu3em");
    }
    if (scope.componentsFor["modeLine"]) {
        scope.componentsFor["modeLine"].setAttribute("for", "modeLine_seu3em")
    }
    // /DIV modeLine
    parents[parents.length] = parent; parent = node;
    // DIV
        // REPEAT modes
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "modes";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("modes", component);
        if (component.setAttribute) {
            component.setAttribute("id", "modes_mpdk5h");
        }
        if (scope.componentsFor["modes"]) {
            scope.componentsFor["modes"].setAttribute("for", "modes_mpdk5h")
        }
        // /REPEAT modes
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = ShcodishModeline
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $REPEAT = require("gutentag/repeat.html");
var $SLOT = require("./slot.html");
var $THIS$0 = function ShcodishModeline$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV mode
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_ecv31h");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_ecv31h")
    }
    if (component.setAttribute) {
        component.setAttribute("class", "mode");
    }
    // /DIV mode
    parents[parents.length] = parent; parent = node;
    // DIV
        // SLOT slot
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // SLOT
            node = {tagName: "slot"};
            node.component = $THIS$0$1;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "slot";
            component = new $SLOT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("slot", component);
        if (component.setAttribute) {
            component.setAttribute("id", "slot_hxi83u");
        }
        if (scope.componentsFor["slot"]) {
            scope.componentsFor["slot"].setAttribute("for", "slot_hxi83u")
        }
        // /SLOT slot
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1 = function ShcodishModeline$0$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["modeline.js","sh.codi.sh","modeline.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/modeline.js
// ----------------------

'use strict';

module.exports = ModeLine;

function ModeLine(body, scope) {
    this.body = body;
    this.mode = null;
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
    this.modeLine = scope.components.modeLine;
};

ModeLine.prototype.hookupMode = function (iteration, scope) {
    var mode = iteration.value;
    scope.components.slot.body.appendChild(mode.componentBody);
    mode.element = scope.components.mode;
};

ModeLine.prototype.show = function show(mode) {
    if (!mode.element) {
        this.modes.value.push(mode);
        this.mode = mode;
    }
    mode.show();
};

ModeLine.prototype.hide = function hide(mode) {
    mode.hide();
};

}],["number.html","sh.codi.sh","number.html",{"./number":39,"gutentag/text.html":9,"gutentag/choose.html":1,"./readline.html":40,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/number.html
// ----------------------

"use strict";
var $SUPER = require("./number");
module.exports = ShcodishNumber;
function ShcodishNumber(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // CHOOSE choose
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // CHOOSE
        node = {tagName: "choose"};
        node.children = {};
        node.children["null"] = $THIS$0;
        node.children["dynamic"] = $THIS$1;
        node.children["static"] = $THIS$3;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "choose";
        component = new $CHOOSE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("choose", component);
    if (component.setAttribute) {
        component.setAttribute("id", "choose_o21xqv");
    }
    if (scope.componentsFor["choose"]) {
        scope.componentsFor["choose"].setAttribute("for", "choose_o21xqv")
    }
    // /CHOOSE choose
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$4;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_bbgc96");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_bbgc96")
    }
    // /MODE mode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishNumber
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TEXT = require("gutentag/text.html");
var $CHOOSE = require("gutentag/choose.html");
var $READLINE = require("./readline.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishNumber$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // EM null
    node = document.createElement("EM");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "number");
    }
    // /EM null
    parents[parents.length] = parent; parent = node;
    // EM
        parent.appendChild(document.createTextNode("not a number"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishNumber$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "number display");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // READLINE readline
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // READLINE
            node = {tagName: "readline"};
            node.component = $THIS$1$2;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "readline";
            component = new $READLINE(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("readline", component);
        if (component.setAttribute) {
            component.setAttribute("id", "readline_4knbw");
        }
        if (scope.componentsFor["readline"]) {
            scope.componentsFor["readline"].setAttribute("for", "readline_4knbw")
        }
        // /READLINE readline
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1$2 = function ShcodishNumber$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$3 = function ShcodishNumber$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "number display");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // TEXT value
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // TEXT
            node = {tagName: "text"};
            node.innerText = "";
            callee = scope.nest();
            callee.argument = node;
            callee.id = "value";
            component = new $TEXT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("value", component);
        if (component.setAttribute) {
            component.setAttribute("id", "value_vcjn4e");
        }
        if (scope.componentsFor["value"]) {
            scope.componentsFor["value"].setAttribute("for", "value_vcjn4e")
        }
        // /TEXT value
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$4 = function ShcodishNumber$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("number:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" edit"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⎋"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" escape"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARGUMENT
        node = {tagName: "argument"};
        node.component = $THIS$4$5;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT null
};
var $THIS$4$5 = function ShcodishNumber$4$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["number.js","sh.codi.sh","number.js",{"./model":35,"./child":25},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/number.js
// --------------------

'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = NumberView;

function NumberView() {
    this.parent = null;
    this._value = new model.Cell(null, new model.Number());
    this.readline = null;
}

NumberView.prototype = Object.create(Child.prototype);
NumberView.prototype.constructor = NumberView;

Object.defineProperty(NumberView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

NumberView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.choose = scope.components.choose;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.choose.value = 'static';
    } else if (id === 'readline') {
        this.readline = component;
        this.readline.parent = this;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value.value;
    }
};

NumberView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = this.value.value === this.value.value ? 'static' : 'null';
    this.modeLine.show(this.mode);
};

NumberView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = this.value.value === this.value.value ? 'static' : 'null';
    this.modeLine.hide(this.mode);
};

NumberView.prototype.draw = function draw() {
    if (this.value.value === this.value.value) {
        this.choose.value = 'static';
        this.static.value = this.value.value;
    } else {
        this.choose.value = 'null';
    }
};

NumberView.prototype.enter = function enter() {
    this.choose.value = 'dynamic';
    if (this.value.value !== null) {
        return this.reenter();
    } else {
        return this.readline.enter();
    }
};

NumberView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

NumberView.prototype.returnFromReadline = function returnFromReadline(text, cursor) {
    if (text == null) {
        if (this.value.value === null) {
            return this.parent.delete();
        } else if (this.parent.canReturn()) {
            return this.parent.return();
        }
    } else {
        this.value.value = +text.replace(/,/g, '');
        this.parent.update(this.value);
        if (this.parent.canProceed()) {
            this.blur();
            return this.parent.proceed();
        }
    }
    this.focus();
    this.parent.focusChild();
    this.draw();
    return this;
};

NumberView.prototype.KeyR = function replace() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('');
};

NumberView.prototype.KeyC =
NumberView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('' + this.value.value);
};

NumberView.prototype.KeyH =
NumberView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

NumberView.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

NumberView.prototype.tab = function tab(number) {
    this.value.value = +number;
    this.draw();
    this.blur();
    return this.parent.tab();
};

NumberView.prototype.canTabBack = function canTabBack() {
    return this.parent.canTabBack();
};

NumberView.prototype.tabBack = function tabBack() {
    this.blur();
    return this.parent.tabBack();
};

}],["readline.html","sh.codi.sh","readline.html",{"./readline":41,"gutentag/text.html":9,"gutentag/reveal.html":6,"gutentag/repeat.html":4,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/readline.html
// ------------------------

"use strict";
var $SUPER = require("./readline");
module.exports = ShcodishReadline;
function ShcodishReadline(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "readline");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // TEXT prefix
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // TEXT
            node = {tagName: "text"};
            node.innerText = "";
            callee = scope.nest();
            callee.argument = node;
            callee.id = "prefix";
            component = new $TEXT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("prefix", component);
        if (component.setAttribute) {
            component.setAttribute("id", "prefix_3rzxf8");
        }
        if (scope.componentsFor["prefix"]) {
            scope.componentsFor["prefix"].setAttribute("for", "prefix_3rzxf8")
        }
        // /TEXT prefix
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "cursor");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // TEXT cursor
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // TEXT
                node = {tagName: "text"};
                node.innerText = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "cursor";
                component = new $TEXT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("cursor", component);
            if (component.setAttribute) {
                component.setAttribute("id", "cursor_momgiz");
            }
            if (scope.componentsFor["cursor"]) {
                scope.componentsFor["cursor"].setAttribute("for", "cursor_momgiz")
            }
            // /TEXT cursor
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // TEXT suffix
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // TEXT
            node = {tagName: "text"};
            node.innerText = "";
            callee = scope.nest();
            callee.argument = node;
            callee.id = "suffix";
            component = new $TEXT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("suffix", component);
        if (component.setAttribute) {
            component.setAttribute("id", "suffix_6qvuk4");
        }
        if (scope.componentsFor["suffix"]) {
            scope.componentsFor["suffix"].setAttribute("for", "suffix_6qvuk4")
        }
        // /TEXT suffix
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$0;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_w8lcas");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_w8lcas")
    }
    // /MODE mode
    // MODE verbatim
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$1;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "verbatim";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("verbatim", component);
    if (component.setAttribute) {
        component.setAttribute("id", "verbatim_hcgirg");
    }
    if (scope.componentsFor["verbatim"]) {
        scope.componentsFor["verbatim"].setAttribute("for", "verbatim_hcgirg")
    }
    // /MODE verbatim
    this.scope.hookup("this", this);
}
var $THIS = ShcodishReadline
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TEXT = require("gutentag/text.html");
var $REVEAL = require("gutentag/reveal.html");
var $REPEAT = require("gutentag/repeat.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishReadline$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("readline:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⎋"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        parent.appendChild(document.createTextNode("^"));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" begin"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        parent.appendChild(document.createTextNode("^"));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("e"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("nd"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "group");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // SP null
        parent.appendChild(document.createTextNode(" erase "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("^"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("u"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("←"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("k"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("→"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "group");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // SP null
        parent.appendChild(document.createTextNode(" char "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("^"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("b"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("←"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("f"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("→"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "group");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // SP null
        parent.appendChild(document.createTextNode(" word "));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⌥"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("b"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("←"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" "));
        // SP null
        parent.appendChild(document.createTextNode(" "));
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "button");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // U null
            node = document.createElement("U");
            parent.appendChild(node);
            component = node.actualNode;
            // /U null
            parents[parents.length] = parent; parent = node;
            // U
                parent.appendChild(document.createTextNode("f"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            parent.appendChild(document.createTextNode("→"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SP null
    parent.appendChild(document.createTextNode(" "));
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("^v"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("erbatim"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$1 = function ShcodishReadline$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("verbatim"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};

}],["readline.js","sh.codi.sh","readline.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/readline.js
// ----------------------

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
        this.verbatim = scope.components.verbatim;
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

Readline.prototype.focus = function focus() {
    this.modeLine.show(this.mode);
    this.draw();
};

Readline.prototype.blur = function blur() {
    this.modeLine.hide(this.mode);
};

// TODO thread read line label:
Readline.prototype.enter = function enter(text) {
    this.text = text || '';
    this.cursor = this.text.length;
    this.focus();
    return this;
};

Readline.prototype.return = function _return(text, cursor) {
    this.blur();
    return this.parent.returnFromReadline(text, cursor);
};

Readline.prototype.Tab = function tab() {
    if (this.parent.canTab()) {
        return this.parent.tab(this.text, this.cursor);
    }
    return this;
};

Readline.prototype.Backspace = function backspace() {
    if (this.cursor > 0) {
        this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
        this.cursor--;
        this.draw();
    }
    return this;
};

Readline.prototype.Ctrl_KeyB =
Readline.prototype.Ctrl_KeyH =
Readline.prototype.ArrowLeft = function arrowLeft() {
    this.cursor = Math.max(0, this.cursor - 1);
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyF =
Readline.prototype.Ctrl_KeyL =
Readline.prototype.ArrowRight = function arrowRight() {
    this.cursor = Math.min(this.text.length, this.cursor + 1);
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyU = function deleteAllBefore() {
    this.text = this.text.slice(this.cursor);
    this.cursor = 0;
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyK = function deleteAllAfter() {
    this.text = this.text.slice(0, this.cursor);
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyA = function gotoBegin() {
    this.cursor = 0;
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyE = function gotoEnd() {
    this.cursor = this.text.length;
    this.draw();
    return this;
};

Readline.prototype.Ctrl_KeyW = function deletePrevWord() {
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

Readline.prototype.Shift_Ctrl_KeyH =
Readline.prototype.Alt_KeyB = function gotoPrevWord() {
    var index = this.cursor - 1;
    while (index >= 0 && this.text[index] === ' ') {
        index--;
    }
    index = this.text.lastIndexOf(' ', index);
    this.cursor = Math.max(0, this.text.lastIndexOf(' ', index));
    this.draw();
    return this;
};

Readline.prototype.Shift_Ctrl_KeyL =
Readline.prototype.Alt_KeyF = function gotoNextWord() {
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

Readline.prototype.Ctrl_KeyV = function verbatim() {
    this.focusVerbatim();
    return new Verbatim(this);
};

Readline.prototype.focusVerbatim = function focusVerbatim() {
    this.modeLine.show(this.verbatim);
};

Readline.prototype.blurVerbatim = function blurVerbatim() {
    this.modeLine.hide(this.verbatim);
};

Readline.prototype.Enter = function enter(label) {
    return this.return(this.text, this.cursor);
};

Readline.prototype.Escape = function escape() {
    return this.return(this.text, this.cursor);
};

Readline.prototype.swap = function swap(index, minus, plus) {
    this.text = this.text.slice(0, index) + plus + this.text.slice(index + minus);
    this.cursor += plus.length;
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
        this.write(key);
        return this;
    }
};

Readline.prototype.write = function write(text) {
    this.swap(this.cursor, 0, text);
    this.draw();
};

function Verbatim(parent) {
    this.parent = parent;
}

Verbatim.prototype.blur = function blur() {
    return this.parent.blurVerbatim();
};

Verbatim.prototype.Tab = function handleTab() {
    this.parent.write('\t');
    return this.exit();
};

Verbatim.prototype.Enter = function handleEnter() {
    this.parent.write('\n');
    return this.exit();
};

Verbatim.prototype.handleEvent = function handleEvent(event, key, keyCode) {
    if (
        event.type === 'keypress'
        // key.length === 1 &&
        // event.ctrlKey === false &&
        // event.altKey === false &&
        // event.metaKey === false
    ) {
        this.parent.write(String.fromCharCode(event.which || event.charCode));
        return this.exit();
    }
};

Verbatim.prototype.exit = function exit() {
    this.blur();
    return this.parent;
};

}],["root.html","sh.codi.sh","root.html",{"./root":43,"./value.html":52},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/root.html
// --------------------

"use strict";
var $SUPER = require("./root");
module.exports = ShcodishRoot;
function ShcodishRoot(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // VALUE component
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // VALUE
        node = {tagName: "value"};
        node.component = $THIS$0;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "component";
        component = new $VALUE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("component", component);
    if (component.setAttribute) {
        component.setAttribute("id", "component_nqvpd3");
    }
    if (scope.componentsFor["component"]) {
        scope.componentsFor["component"].setAttribute("for", "component_nqvpd3")
    }
    // /VALUE component
    this.scope.hookup("this", this);
}
var $THIS = ShcodishRoot
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $VALUE = require("./value.html");
var $THIS$0 = function ShcodishRoot$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("root:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("elete"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};

}],["root.js","sh.codi.sh","root.js",{"./clip":26,"./model":35},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/root.js
// ------------------

'use strict';

var Clip = require('./clip');
var model = require('./model');

module.exports = Root;

function Root(body, scope) {
    this.component = null;
    this.modeLine = null;
    this.handler = null;
}

Root.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    } else if (id === 'modeLine') {
        scope.root.modeLine = component;
    }
};

Object.defineProperty(Root.prototype, 'value', {
    get: function getValue() {
        return this.component.value;
    },
    set: function setValue(value) {
        this.component.value = value;
    }
});

Root.prototype.update = function udpate(value) {
    this.parent.update(this.value);
};

Root.prototype.enter = function enter() {
    return this.component.enter();
};

Root.prototype.hookupThis = function hookupThis(scope) {
    scope.root.clip = new Clip();
    this.component = scope.components.component;
    this.component.parent = this;
    this.modeLine = scope.components.modeLine;
};

Root.prototype.delete = function _delete() {
    this.value = new model.Cell(null, model.any);
    this.parent.update(this.value);
    return this.component.enter();
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

Root.prototype.canToTop = function canToTop() {
    return false;
};

Root.prototype.canToBottom = function canToBottom() {
    return false;
};

Root.prototype.canTab = function canTab() {
    return false;
};

Root.prototype.canTabBack = function canTabBack() {
    return false;
};

Root.prototype.canProceed = function canProceed() {
    return false;
};

}],["slot.html","sh.codi.sh","slot.html",{"./slot":45},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/slot.html
// --------------------

"use strict";
module.exports = (require)("./slot");

}],["slot.js","sh.codi.sh","slot.js",{},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/slot.js
// ------------------

'use strict';

module.exports = Slot;

function Slot(body) {
    this.body = body;
}

}],["string.html","sh.codi.sh","string.html",{"./string":47,"gutentag/text.html":9,"gutentag/choose.html":1,"./readline.html":40,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/string.html
// ----------------------

"use strict";
var $SUPER = require("./string");
module.exports = ShcodishString;
function ShcodishString(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // CHOOSE choose
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // CHOOSE
        node = {tagName: "choose"};
        node.children = {};
        node.children["null"] = $THIS$0;
        node.children["dynamic"] = $THIS$1;
        node.children["static"] = $THIS$3;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "choose";
        component = new $CHOOSE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("choose", component);
    if (component.setAttribute) {
        component.setAttribute("id", "choose_lri1eu");
    }
    if (scope.componentsFor["choose"]) {
        scope.componentsFor["choose"].setAttribute("for", "choose_lri1eu")
    }
    // /CHOOSE choose
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$4;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_qs2q8g");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_qs2q8g")
    }
    // /MODE mode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishString
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TEXT = require("gutentag/text.html");
var $CHOOSE = require("gutentag/choose.html");
var $READLINE = require("./readline.html");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishString$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // EM null
    node = document.createElement("EM");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "string");
    }
    // /EM null
    parents[parents.length] = parent; parent = node;
    // EM
        parent.appendChild(document.createTextNode("empty string"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishString$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "string display");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // READLINE readline
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // READLINE
            node = {tagName: "readline"};
            node.component = $THIS$1$2;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "readline";
            component = new $READLINE(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("readline", component);
        if (component.setAttribute) {
            component.setAttribute("id", "readline_d42eji");
        }
        if (scope.componentsFor["readline"]) {
            scope.componentsFor["readline"].setAttribute("for", "readline_d42eji")
        }
        // /READLINE readline
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1$2 = function ShcodishString$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$3 = function ShcodishString$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "string display");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // TEXT value
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // TEXT
            node = {tagName: "text"};
            node.innerText = "";
            callee = scope.nest();
            callee.argument = node;
            callee.id = "value";
            component = new $TEXT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("value", component);
        if (component.setAttribute) {
            component.setAttribute("id", "value_mfcvu7");
        }
        if (scope.componentsFor["value"]) {
            scope.componentsFor["value"].setAttribute("for", "value_mfcvu7")
        }
        // /TEXT value
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$4 = function ShcodishString$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("string:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" edit"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("⎋"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" escape"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("u"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("pper"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("l"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ower"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARGUMENT null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARGUMENT
        node = {tagName: "argument"};
        node.component = $THIS$4$5;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARGUMENT null
};
var $THIS$4$5 = function ShcodishString$4$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["string.js","sh.codi.sh","string.js",{"./model":35,"./child":25},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/string.js
// --------------------

'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = StringView;

function StringView() {
    this.parent = null;
    this._value = new model.Cell(null, new model.String());
    this.readline = null;
}

StringView.prototype = Object.create(Child.prototype);
StringView.prototype.constructor = StringView;

Object.defineProperty(StringView.prototype, 'value', {
    get: function getValue() {
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.draw();
    }
});

StringView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.choose = scope.components.choose;
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.choose.value = 'static';
    } else if (id === 'readline') {
        this.readline = component;
        this.readline.parent = this;
    } else if (id === 'value') {
        this.static = component;
        component.value = this.value.value;
    }
};

StringView.prototype.focus = function focus() {
    this.parent.focusChild();
    this.choose.value = this.value.value ? 'static' : 'null';
    this.modeLine.show(this.mode);
};

StringView.prototype.blur = function blur() {
    this.parent.blurChild();
    this.choose.value = this.value.value ? 'static' : 'null';
    this.modeLine.hide(this.mode);
};

StringView.prototype.draw = function draw() {
    if (this.static) {
        this.choose.value = this.value.value ? 'static' : 'null';
        this.static.value = this.value.value;
    }
};

StringView.prototype.enter = function enter() {
    this.choose.value = 'dynamic'
    if (this.value.value !== null) {
        return this.reenter();
    } else {
        return this.readline.enter();
    }
};

StringView.prototype.reenter = function reenter() {
    this.focus();
    return this;
};

StringView.prototype.returnFromReadline = function returnFromReadline(text, cursor) {
    this.value.value = text;
    this.parent.update(this.value);
    if (this.parent.canProceed()) {
        this.blur();
        return this.parent.proceed();
    }
    this.focus();
    this.parent.focusChild();
    return this;
};

StringView.prototype.KeyU = function upper() {
    if (this.value.value == null) {
        return this;
    }
    this.value.value = this.value.value.toUpperCase();
    this.draw();
    return this;
};

StringView.prototype.KeyL = function upper() {
    if (this.value.value == null) {
        return this;
    }
    this.value.value = this.value.value.toLowerCase();
    this.draw();
    return this;
};

StringView.prototype.KeyR = function replace() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter('');
};

StringView.prototype.KeyC =
StringView.prototype.Enter = function enter() {
    this.choose.value = 'dynamic';
    this.parent.blurChild();
    return this.readline.enter(this.value.value);
};

StringView.prototype.KeyH =
StringView.prototype.Escape = function escape() {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

StringView.prototype.canTab = function canTab() {
    return this.parent.canTab();
};

StringView.prototype.tab = function tab(text) {
    this.value.value = text;
    this.draw();
    this.blur();
    return this.parent.tab();
};

StringView.prototype.canTabBack = function canTabBack() {
    return this.parent.canTabBack();
};

StringView.prototype.tabBack = function tabBack() {
    this.blur();
    return this.parent.tabBack();
};

}],["struct-type.js","sh.codi.sh","struct-type.js",{"./array":21},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/struct-type.js
// -------------------------

'use strict';

var ArrayView = require('./array');

module.exports = StructType;

function StructType() {
}

StructType.prototype = Object.create(ArrayView.prototype);
StructType.prototype.constructor = StructType;

StructType.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.elements = scope.components.elements;
        this.ifEmpty = scope.components.ifEmpty;
        this.mode = scope.components.mode;
        this.emptyMode = scope.components.emptyMode;
        this.modeLine = scope.modeLine;
        this.resize();
    } else if (id === 'elements:iteration') {
        this.index['$' + component.value.key] = component;
        scope.components.key.value = component.value.key;
        scope.components.key.parent = this;
        scope.components.value.value = component.value.value;
        scope.components.value.parent = this;
    } else if (id === 'emptyElement') {
        this.emptyElement = component;
    }
};

function Field(id, name, type, optional, def) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.optional = optional;
    this.default = def;
}

}],["struct-type.xml","sh.codi.sh","struct-type.xml",{"./struct-type":48,"gutentag/repeat.html":4,"gutentag/reveal.html":6,"gutentag/text.html":9,"./type.xml":51,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/struct-type.xml
// --------------------------

"use strict";
var $SUPER = require("./struct-type");
module.exports = ShcodishStructtype;
function ShcodishStructtype(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV 
    node = document.createElement("div");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "structBox");
    }
    // /DIV 
    parents[parents.length] = parent; parent = node;
    // div
        // TABLE 
        node = document.createElement("table");
        parent.appendChild(node);
        component = node.actualNode;
        // /TABLE 
        parents[parents.length] = parent; parent = node;
        // table
            // REVEAL ifEmpty
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // reveal
                node = {tagName: "reveal"};
                node.component = $THIS$0;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "ifEmpty";
                component = new $REVEAL(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("ifEmpty", component);
            if (component.setAttribute) {
                component.setAttribute("id", "ifEmpty_ncecds");
            }
            if (scope.componentsFor["ifEmpty"]) {
                scope.componentsFor["ifEmpty"].setAttribute("for", "ifEmpty_ncecds")
            }
            // /REVEAL ifEmpty
            // REPEAT elements
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // repeat
                node = {tagName: "repeat"};
                node.component = $THIS$1;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "elements";
                component = new $REPEAT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("elements", component);
            if (component.setAttribute) {
                component.setAttribute("id", "elements_tkxogt");
            }
            if (scope.componentsFor["elements"]) {
                scope.componentsFor["elements"].setAttribute("for", "elements_tkxogt")
            }
            // /REPEAT elements
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$4;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_y85bae");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_y85bae")
    }
    // /MODE mode
    // MODE emptyMode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$6;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "emptyMode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("emptyMode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "emptyMode_xs74og");
    }
    if (scope.componentsFor["emptyMode"]) {
        scope.componentsFor["emptyMode"].setAttribute("for", "emptyMode_xs74og")
    }
    // /MODE emptyMode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishStructtype
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $REPEAT = require("gutentag/repeat.html");
var $REVEAL = require("gutentag/reveal.html");
var $TEXT = require("gutentag/text.html");
var $TYPE = require("./type.xml");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishStructtype$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TD 
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("colspan", "2");
        }
        // /TD 
        parents[parents.length] = parent; parent = node;
        // td
            // SPAN emptyElement
            node = document.createElement("span");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("emptyElement", component);
            if (component.setAttribute) {
                component.setAttribute("class", "element");
            }
            if (component.setAttribute) {
                component.setAttribute("id", "emptyElement_jl01ex");
            }
            if (scope.componentsFor["emptyElement"]) {
                scope.componentsFor["emptyElement"].setAttribute("for", "emptyElement_jl01ex")
            }
            // /SPAN emptyElement
            parents[parents.length] = parent; parent = node;
            // span
                // EM 
                node = document.createElement("em");
                parent.appendChild(node);
                component = node.actualNode;
                // /EM 
                parents[parents.length] = parent; parent = node;
                // em
                    parent.appendChild(document.createTextNode("no fields"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishStructtype$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TR 
    node = document.createElement("tr");
    parent.appendChild(node);
    component = node.actualNode;
    // /TR 
    parents[parents.length] = parent; parent = node;
    // tr
        // TH keyBox
        node = document.createElement("th");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("keyBox", component);
        if (component.setAttribute) {
            component.setAttribute("id", "keyBox_hvfmki");
        }
        if (scope.componentsFor["keyBox"]) {
            scope.componentsFor["keyBox"].setAttribute("for", "keyBox_hvfmki")
        }
        // /TH keyBox
        parents[parents.length] = parent; parent = node;
        // th
            // TYPE key
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // type
                node = {tagName: "type"};
                node.component = $THIS$1$2;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "key";
                component = new $TYPE(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("key", component);
            if (component.setAttribute) {
                component.setAttribute("id", "key_7yoegy");
            }
            if (scope.componentsFor["key"]) {
                scope.componentsFor["key"].setAttribute("for", "key_7yoegy")
            }
            // /TYPE key
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // TD valueBox
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("valueBox", component);
        if (component.setAttribute) {
            component.setAttribute("id", "valueBox_yes0no");
        }
        if (scope.componentsFor["valueBox"]) {
            scope.componentsFor["valueBox"].setAttribute("for", "valueBox_yes0no")
        }
        if (component.setAttribute) {
            component.setAttribute("class", "valueBox");
        }
        // /TD valueBox
        parents[parents.length] = parent; parent = node;
        // td
            // TYPE value
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // type
                node = {tagName: "type"};
                node.component = $THIS$1$3;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "value";
                component = new $TYPE(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("value", component);
            if (component.setAttribute) {
                component.setAttribute("id", "value_pltmd4");
            }
            if (scope.componentsFor["value"]) {
                scope.componentsFor["value"].setAttribute("for", "value_pltmd4")
            }
            // /TYPE value
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // TD 
        node = document.createElement("td");
        parent.appendChild(node);
        component = node.actualNode;
        // /TD 
        parents[parents.length] = parent; parent = node;
        // td
            // TEXT constraint
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // text
                node = {tagName: "text"};
                node.innerText = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "constraint";
                component = new $TEXT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("constraint", component);
            if (component.setAttribute) {
                component.setAttribute("id", "constraint_u52an4");
            }
            if (scope.componentsFor["constraint"]) {
                scope.componentsFor["constraint"].setAttribute("for", "constraint_u52an4")
            }
            // /TEXT constraint
            // TEXT description
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // text
                node = {tagName: "text"};
                node.innerText = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "description";
                component = new $TEXT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("description", component);
            if (component.setAttribute) {
                component.setAttribute("id", "description_nd3mwm");
            }
            if (scope.componentsFor["description"]) {
                scope.componentsFor["description"].setAttribute("for", "description_nd3mwm")
            }
            // /TEXT description
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1$2 = function ShcodishStructtype$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("struct:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("hjkl"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" move"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("dd"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("elete"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to first"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to last"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$1$3 = function ShcodishStructtype$1$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("struct:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("hjkl"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode(" move"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to first"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("g"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("o to last"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("y"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ank"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
};
var $THIS$4 = function ShcodishStructtype$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("struct:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARG 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // arg
        node = {tagName: "arg"};
        node.component = $THIS$4$5;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG 
};
var $THIS$4$5 = function ShcodishStructtype$4$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$6 = function ShcodishStructtype$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("struct:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("⏎"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARG 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // arg
        node = {tagName: "arg"};
        node.component = $THIS$6$7;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG 
};
var $THIS$6$7 = function ShcodishStructtype$6$7(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["type.js","sh.codi.sh","type.js",{"./model":35},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/type.js
// ------------------

'use strict';

var model = require('./model');

module.exports = TypeView;

function TypeView() {
}

TypeView.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'mode') {
        this.mode = component;
    } else if (id === 'view') {
        this.view = component;
    } else if (id === 'this') {
        this.modeLine = scope.modeLine;
    } else if (id === 'view:array') {
        this.component = scope.components.of;
        this.component.parent = this;
    } else if (id === 'view:map') {
        this.key = scope.components.key;
        this.key.parent = this;
        this.value = scope.components.value;
        this.value.parent = this;
    } else if (id === 'view:struct') {
        this.component = scope.components.component;
        this.component.parent = this;
    }
};

TypeView.prototype.focus = function focus() {
    this.view.value = 'active';
    this.modeLine.show(this.mode);
};

TypeView.prototype.blur = function blur() {
    this.view.value = 'any';
    this.modeLine.hide(this.mode);
};

TypeView.prototype.enter = function enter() {
    this.focus();
    return this;
};

TypeView.prototype.enterArrayOf = function enterArrayOf() {
    this.view.value = 'array';
    return this.component.enter();
};

TypeView.prototype.enterMapOf = function enterMapOf() {
    this.view.value = 'map';
    return this.key.enter();
};

TypeView.prototype.enterStructOf = function enterStructOf() {
    this.view.value = 'struct';
    return this.component.enter();
};

TypeView.prototype.KeyN = function selectNumberType() {
    this.view.value = 'number';
    return this.parent.returnFromType(new model.Cell(null, model.number), this);
};

TypeView.prototype.KeyS = function selectStringType() {
    this.view.value = 'string';
    return this.parent.returnFromType(new model.Cell(null, model.string), this);
};

TypeView.prototype.KeyB = function selectBooleanType() {
    this.view.value = 'boolean';
    return this.parent.returnFromType(new model.Cell(null, model.boolean), this);
};

TypeView.prototype.KeyA = function selectArrayType() {
    this.view.value = 'array';
    return this.parent.returnFromType(model.array, this);
};

TypeView.prototype.Shift_KeyA = function selectArrayOfType() {
    this.view.value = 'array';
    return this.component.enter();
};

TypeView.prototype.KeyM = function selectMapType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Map(model.any, model.any)), this);
};

TypeView.prototype.Shift_KeyM = function selectMapOfType() {
    this.view.value = 'map';
    return this.key.enter();
};

TypeView.prototype.KeyO = function selectObjectType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Object()), this);
};

TypeView.prototype.KeyD = function selectDictType() {
    this.view.value = 'map';
    return this.parent.returnFromType(new model.Cell(null, new model.Object(model.string)), this);
};

TypeView.prototype.returnFromType = function returnFromType(cell, child) {
    if (child === this.key) {
        this.keyModel = cell.model;
        return this.value.enter();
    } else if (child === this.value) {
        return this.parent.returnFromType(new model.Cell([], new model.Map(this.keyModel, cell.model)), this);
    } else {
        return this.parent.returnFromType(new model.Cell([], new model.Array(cell.model)), this);
    }
};

}],["type.xml","sh.codi.sh","type.xml",{"./type":50,"gutentag/choose.html":1,"./mode.html":33,"./struct-type.xml":49},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/type.xml
// -------------------

"use strict";
var $SUPER = require("./type");
module.exports = ShcodishType;
function ShcodishType(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // CHOOSE view
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // choose
        node = {tagName: "choose"};
        node.children = {};
        node.children["active"] = $THIS$0;
        node.children["any"] = $THIS$1;
        node.children["number"] = $THIS$2;
        node.children["string"] = $THIS$3;
        node.children["boolean"] = $THIS$4;
        node.children["array"] = $THIS$5;
        node.children["map"] = $THIS$7;
        node.children["struct"] = $THIS$10;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "view";
        component = new $CHOOSE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("view", component);
    if (component.setAttribute) {
        component.setAttribute("id", "view_e465na");
    }
    if (scope.componentsFor["view"]) {
        scope.componentsFor["view"].setAttribute("for", "view_e465na")
    }
    // /CHOOSE view
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // mode
        node = {tagName: "mode"};
        node.component = $THIS$12;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_pfcqwo");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_pfcqwo")
    }
    // /MODE mode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishType
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $CHOOSE = require("gutentag/choose.html");
var $MODE = require("./mode.html");
var $STRUCT_TYPE = require("./struct-type.xml");
var $THIS$0 = function ShcodishType$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "element active");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // EM 
        node = document.createElement("em");
        parent.appendChild(node);
        component = node.actualNode;
        // /EM 
        parents[parents.length] = parent; parent = node;
        // em
            parent.appendChild(document.createTextNode("?"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishType$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    parent.appendChild(document.createTextNode("any type"));
};
var $THIS$2 = function ShcodishType$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    parent.appendChild(document.createTextNode("number"));
};
var $THIS$3 = function ShcodishType$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    parent.appendChild(document.createTextNode("string"));
};
var $THIS$4 = function ShcodishType$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    parent.appendChild(document.createTextNode("boolean"));
};
var $THIS$5 = function ShcodishType$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    parent.appendChild(document.createTextNode("array of "));
    // THIS of
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // this
        node = {tagName: "this"};
        node.component = $THIS$5$6;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "of";
        component = new $THIS(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("of", component);
    if (component.setAttribute) {
        component.setAttribute("id", "of_v2lbi5");
    }
    if (scope.componentsFor["of"]) {
        scope.componentsFor["of"].setAttribute("for", "of_v2lbi5")
    }
    // /THIS of
};
var $THIS$5$6 = function ShcodishType$5$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$7 = function ShcodishType$7(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    parent.appendChild(document.createTextNode("map from "));
    parent.appendChild(document.createTextNode("["));
    // THIS key
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // this
        node = {tagName: "this"};
        node.component = $THIS$7$8;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "key";
        component = new $THIS(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("key", component);
    if (component.setAttribute) {
        component.setAttribute("id", "key_w8n5hj");
    }
    if (scope.componentsFor["key"]) {
        scope.componentsFor["key"].setAttribute("for", "key_w8n5hj")
    }
    // /THIS key
    parent.appendChild(document.createTextNode("]"));
    // SP 
    parent.appendChild(document.createTextNode(" to "));
    // THIS value
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // this
        node = {tagName: "this"};
        node.component = $THIS$7$9;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "value";
        component = new $THIS(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("value", component);
    if (component.setAttribute) {
        component.setAttribute("id", "value_4uk5u");
    }
    if (scope.componentsFor["value"]) {
        scope.componentsFor["value"].setAttribute("for", "value_4uk5u")
    }
    // /THIS value
};
var $THIS$7$8 = function ShcodishType$7$8(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$7$9 = function ShcodishType$7$9(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$10 = function ShcodishType$10(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // STRUCT-TYPE component
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // struct-type
        node = {tagName: "struct-type"};
        node.component = $THIS$10$11;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "component";
        component = new $STRUCT_TYPE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("component", component);
    if (component.setAttribute) {
        component.setAttribute("id", "component_hl8bhd");
    }
    if (scope.componentsFor["component"]) {
        scope.componentsFor["component"].setAttribute("for", "component_hl8bhd")
    }
    // /STRUCT-TYPE component
};
var $THIS$10$11 = function ShcodishType$10$11(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$12 = function ShcodishType$12(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP 
    // STRONG 
    node = document.createElement("strong");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG 
    parents[parents.length] = parent; parent = node;
    // strong
        parent.appendChild(document.createTextNode("type:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("s"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("tring"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("n"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("umber"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("b"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("oolean"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rray"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rray of…"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("m"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ap"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("m"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ap of…"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("o"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("bject"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ict"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP 
    // SPAN 
    node = document.createElement("span");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN 
    parents[parents.length] = parent; parent = node;
    // span
        parent.appendChild(document.createTextNode("⇧"));
        // U 
        node = document.createElement("u");
        parent.appendChild(node);
        component = node.actualNode;
        // /U 
        parents[parents.length] = parent; parent = node;
        // u
            parent.appendChild(document.createTextNode("s"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("truct of…"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARG 
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // arg
        node = {tagName: "arg"};
        node.component = $THIS$12$13;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = "";
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG 
};
var $THIS$12$13 = function ShcodishType$12$13(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["value.html","sh.codi.sh","value.html",{"./value":53,"gutentag/text.html":9,"gutentag/choose.html":1,"./number.html":38,"./string.html":46,"./boolean.html":23,"./array.xml":22,"./map.xml":32,"./type.xml":51,"./mode.html":33},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/value.html
// ---------------------

"use strict";
var $SUPER = require("./value");
module.exports = ShcodishValue;
function ShcodishValue(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV element
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("element", component);
    if (component.setAttribute) {
        component.setAttribute("id", "element_e5p0ol");
    }
    if (scope.componentsFor["element"]) {
        scope.componentsFor["element"].setAttribute("for", "element_e5p0ol")
    }
    if (component.setAttribute) {
        component.setAttribute("class", "element");
    }
    // /DIV element
    parents[parents.length] = parent; parent = node;
    // DIV
        // CHOOSE view
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // CHOOSE
            node = {tagName: "choose"};
            node.children = {};
            node.children["any"] = $THIS$0;
            node.children["type"] = $THIS$1;
            node.children["boolean"] = $THIS$4;
            node.children["number"] = $THIS$7;
            node.children["string"] = $THIS$10;
            node.children["array"] = $THIS$13;
            node.children["map"] = $THIS$16;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "view";
            component = new $CHOOSE(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("view", component);
        if (component.setAttribute) {
            component.setAttribute("id", "view_gafjit");
        }
        if (scope.componentsFor["view"]) {
            scope.componentsFor["view"].setAttribute("for", "view_gafjit")
        }
        // /CHOOSE view
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // MODE mode
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MODE
        node = {tagName: "mode"};
        node.component = $THIS$19;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "mode";
        component = new $MODE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("mode", component);
    if (component.setAttribute) {
        component.setAttribute("id", "mode_rcbik1");
    }
    if (scope.componentsFor["mode"]) {
        scope.componentsFor["mode"].setAttribute("for", "mode_rcbik1")
    }
    // /MODE mode
    this.scope.hookup("this", this);
}
var $THIS = ShcodishValue
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TEXT = require("gutentag/text.html");
var $CHOOSE = require("gutentag/choose.html");
var $NUMBER = require("./number.html");
var $STRING = require("./string.html");
var $BOOLEAN = require("./boolean.html");
var $ARRAY = require("./array.xml");
var $MAP = require("./map.xml");
var $TYPE = require("./type.xml");
var $MODE = require("./mode.html");
var $THIS$0 = function ShcodishValue$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // EM null
    node = document.createElement("EM");
    parent.appendChild(node);
    component = node.actualNode;
    // /EM null
    parents[parents.length] = parent; parent = node;
    // EM
        parent.appendChild(document.createTextNode("no value"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$1 = function ShcodishValue$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // TYPE type
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // TYPE
        node = {tagName: "type"};
        node.component = $THIS$1$2;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "type";
        component = new $TYPE(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("type", component);
    if (component.setAttribute) {
        component.setAttribute("id", "type_nmesko");
    }
    if (scope.componentsFor["type"]) {
        scope.componentsFor["type"].setAttribute("for", "type_nmesko")
    }
    // /TYPE type
};
var $THIS$1$2 = function ShcodishValue$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$1$2$3;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$1$2$3 = function ShcodishValue$1$2$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$4 = function ShcodishValue$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // BOOLEAN boolean
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // BOOLEAN
        node = {tagName: "boolean"};
        node.component = $THIS$4$5;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "boolean";
        component = new $BOOLEAN(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("boolean", component);
    if (component.setAttribute) {
        component.setAttribute("id", "boolean_4fe8zt");
    }
    if (scope.componentsFor["boolean"]) {
        scope.componentsFor["boolean"].setAttribute("for", "boolean_4fe8zt")
    }
    // /BOOLEAN boolean
};
var $THIS$4$5 = function ShcodishValue$4$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$4$5$6;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$4$5$6 = function ShcodishValue$4$5$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$7 = function ShcodishValue$7(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // NUMBER number
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // NUMBER
        node = {tagName: "number"};
        node.component = $THIS$7$8;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "number";
        component = new $NUMBER(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("number", component);
    if (component.setAttribute) {
        component.setAttribute("id", "number_jhxk1f");
    }
    if (scope.componentsFor["number"]) {
        scope.componentsFor["number"].setAttribute("for", "number_jhxk1f")
    }
    // /NUMBER number
};
var $THIS$7$8 = function ShcodishValue$7$8(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$7$8$9;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$7$8$9 = function ShcodishValue$7$8$9(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$10 = function ShcodishValue$10(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // STRING string
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // STRING
        node = {tagName: "string"};
        node.component = $THIS$10$11;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "string";
        component = new $STRING(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("string", component);
    if (component.setAttribute) {
        component.setAttribute("id", "string_u72edq");
    }
    if (scope.componentsFor["string"]) {
        scope.componentsFor["string"].setAttribute("for", "string_u72edq")
    }
    // /STRING string
};
var $THIS$10$11 = function ShcodishValue$10$11(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$10$11$12;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$10$11$12 = function ShcodishValue$10$11$12(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$13 = function ShcodishValue$13(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARRAY array
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARRAY
        node = {tagName: "array"};
        node.component = $THIS$13$14;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "array";
        component = new $ARRAY(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("array", component);
    if (component.setAttribute) {
        component.setAttribute("id", "array_yt8qvh");
    }
    if (scope.componentsFor["array"]) {
        scope.componentsFor["array"].setAttribute("for", "array_yt8qvh")
    }
    // /ARRAY array
};
var $THIS$13$14 = function ShcodishValue$13$14(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$13$14$15;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$13$14$15 = function ShcodishValue$13$14$15(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$16 = function ShcodishValue$16(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // MAP map
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // MAP
        node = {tagName: "map"};
        node.component = $THIS$16$17;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "map";
        component = new $MAP(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("map", component);
    if (component.setAttribute) {
        component.setAttribute("id", "map_7zw4m1");
    }
    if (scope.componentsFor["map"]) {
        scope.componentsFor["map"].setAttribute("for", "map_7zw4m1")
    }
    // /MAP map
};
var $THIS$16$17 = function ShcodishValue$16$17(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$16$17$18;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$16$17$18 = function ShcodishValue$16$17$18(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$19 = function ShcodishValue$19(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SP null
    // STRONG null
    node = document.createElement("STRONG");
    parent.appendChild(node);
    component = node.actualNode;
    // /STRONG null
    parents[parents.length] = parent; parent = node;
    // STRONG
        parent.appendChild(document.createTextNode("type:"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("s"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("tring"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("n"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("umber"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rray"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        parent.appendChild(document.createTextNode("⇧"));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("a"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rray of…"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("m"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ap"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        parent.appendChild(document.createTextNode("⇧"));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("m"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ap of…"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("o"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("bject"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        parent.appendChild(document.createTextNode("⇧"));
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("d"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("ict"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("t"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("rue"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("f"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("alse"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // SP null
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "button");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // U null
        node = document.createElement("U");
        parent.appendChild(node);
        component = node.actualNode;
        // /U null
        parents[parents.length] = parent; parent = node;
        // U
            parent.appendChild(document.createTextNode("p"));
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        parent.appendChild(document.createTextNode("aste"));
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    parent.appendChild(document.createTextNode(" "));
    // ARG null
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // ARG
        node = {tagName: "arg"};
        node.component = $THIS$19$20;
        callee = scope.caller.nest();
        if (callee.argument) {
            callee.id = null;
            component = new callee.argument.component(parent, callee);
        } else {
            component = new node.component(parent, scope);
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // /ARG null
};
var $THIS$19$20 = function ShcodishValue$19$20(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["value.js","sh.codi.sh","value.js",{"./model":35,"./child":25},function (require, exports, module, __filename, __dirname){

// sh.codi.sh/value.js
// -------------------

'use strict';

var model = require('./model');
var Child = require('./child');

module.exports = Value;

function Value(body, scope) {
    this._value = new model.Cell(null, model.any);
    this.parent = null;
    this.component = null;
}

Value.prototype = Object.create(Child.prototype);
Value.prototype.constructor = Value;

Object.defineProperty(Value.prototype, 'value', {
    get: function getValue() {
        if (this.component) {
            return this.component.value;
        }
        return this._value;
    },
    set: function setValue(value) {
        this._value = value;
        this.view.value = value.model.view;
        if (this.component) {
            this.component.value = value;
        }
    }
});

Value.prototype.update = function update(cell) {
    this.parent.update(cell);
};

Value.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.mode = scope.components.mode;
        this.modeLine = scope.modeLine;
        this.element = scope.components.element;
        this.view = scope.components.view;
    } else if (id === 'view:any') {
        this.component = null;
    } else if (id === 'view:type') {
        this.component = scope.components.type;
        this.component.parent = this;
    } else if (id === 'view:string') {
        this.component = scope.components.string;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:number') {
        this.component = scope.components.number;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:boolean') {
        this.component = scope.components.boolean;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:array') {
        this.component = scope.components.array;
        this.component.parent = this;
        this.component.value = this.value;
    } else if (id === 'view:map') {
        this.component = scope.components.map;
        this.component.parent = this;
        this.component.value = this.value;
    }
};

Value.prototype.enter = function enter() {
    return this.bounce();
};

Value.prototype.canReenter = function canReenter() {
    return true;
};

Value.prototype.reenter = function reenter() {
    if (this.component) {
        return this.component.reenter();
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.bounce = function bounce() {
    if (this.component) {
        return this.component.enter();
    } else {
        this.focus();
        return this;
    }
};

Value.prototype.KeyS = function () {
    this.value = new model.Cell(null, model.string);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyN = function () {
    this.value = new model.Cell(null, model.number);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyT = function () {
    this.value = new model.Cell(true, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyF = function () {
    this.value = new model.Cell(false, model.boolean);
    this.blur();
    return this.component.enter();
};

Value.prototype.KeyA = function () {
    this.value = new model.Cell([], model.array);
    this.blur();
    return this.component.enter();
};

Value.prototype.Shift_KeyA = function () {
    this.view.value = 'type';
    this.blur();
    return this.component.enterArrayOf();
};

Value.prototype.KeyM = function () {
    this.value = new model.Cell([], new model.Map(model.any, model.any));
    this.blur();
    return this.component.enter();
};

Value.prototype.Shift_KeyM = function () {
    this.view.value = 'type';
    this.blur();
    return this.component.enterMapOf();
};

Value.prototype.KeyO = function () {
    this.value = new model.Cell([], new model.Object());
    this.blur();
    return this.component.enter();
};

Value.prototype.Shift_KeyD = function () {
    this.value = new model.Cell([], new model.Object(model.string));
    this.blur();
    return this.component.enter();
};

Value.prototype.Shift_KeyS = function () {
    this.view.value = 'type';
    this.blur();
    return this.component.enterStructOf();
};

Value.prototype.returnFromType = function returnFromType(cell) {
    this.value = cell;
    return this.component.enter();
};

Value.prototype.KeyH =
Value.prototype.Escape = function () {
    if (this.parent.canReturn()) {
        this.blur();
        return this.parent.return();
    }
    return this;
};

Value.prototype.KeyP = function () {
    this.value = this.scope.clip.get();
    this.parent.update();
    this.blur();
    return this.reenter();
};

Value.prototype.blurChild = function () {
    this.element.classList.remove('active');
};

Value.prototype.focusChild = function () {
    this.element.classList.add('active');
};

Value.prototype.blur = function () {
    this.modeLine.hide(this.mode);
    this.element.classList.remove('active');
};

Value.prototype.focus = function () {
    this.modeLine.show(this.mode);
    this.element.classList.add('active');
};

// TODO list
// TODO tuple
// TODO dict
// TODO map
// TODO struct
// TODO union
// TODO enum
// TODO binary data
// TODO image (dimensions)
// TODO plane
// TODO matrix
// TODO earth lat,lng
// TODO color

}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("sh.codi.sh/index.js")