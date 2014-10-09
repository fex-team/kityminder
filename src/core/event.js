var MinderEvent = kity.createClass('MindEvent', {
    constructor: function(type, params, canstop) {
        params = params || {};
        if (params.getType && params.getType() == 'ShapeEvent') {
            this.kityEvent = params;
            this.originEvent = params.originEvent;
            this.getPosition = params.getPosition.bind(params);
        } else if (params.target && params.preventDefault) {
            this.originEvent = params;
        } else {
            kity.Utils.extend(this, params);
        }
        this.type = type;
        this._canstop = canstop || false;
    },

    getTargetNode: function() {
        var findShape = this.kityEvent && this.kityEvent.targetShape;
        if (!findShape) return null;
        while (!findShape.minderNode && findShape.container) {
            findShape = findShape.container;
        }
        var node = findShape.minderNode;
        if (node && findShape.getOpacity() < 1) return null;
        return node || null;
    },

    stopPropagation: function() {
        this._stoped = true;
    },

    stopPropagationImmediately: function() {
        this._immediatelyStoped = true;
        this._stoped = true;
    },

    shouldStopPropagation: function() {
        return this._canstop && this._stoped;
    },

    shouldStopPropagationImmediately: function() {
        return this._canstop && this._immediatelyStoped;
    },
    preventDefault: function() {
        this.originEvent.preventDefault();
    },
    isRightMB: function() {
        var isRightMB = false;
        if (!this.originEvent) {
            return false;
        }
        if ("which" in this.originEvent)
            isRightMB = this.originEvent.which == 3;
        else if ("button" in this.originEvent)
            isRightMB = this.originEvent.button == 2;
        return isRightMB;
    },
    getKeyCode: function(){
        var evt = this.originEvent;
        return evt.keyCode || evt.which;
    }
});

Minder.registerInit(function() {
    this._initEvents();
});

// 事件机制
kity.extendClass(Minder, {
    _initEvents: function() {
        this._eventCallbacks = {};
    },
    _bindEvents: function() {
        this._bindPaperEvents();
        this._bindKeyboardEvents();
    },
    _resetEvents: function() {
        this._initEvents();
        this._bindEvents();
    },
    // TODO: mousemove lazy bind
    _bindPaperEvents: function() {
        this._paper.on('click dblclick mousedown contextmenu mouseup mousemove mousewheel DOMMouseScroll touchstart touchmove touchend dragenter dragleave drop', this._firePharse.bind(this));
        if (window) {
            window.addEventListener('resize', this._firePharse.bind(this));
            window.addEventListener('blur', this._firePharse.bind(this));
        }
    },
    _bindKeyboardEvents: function() {
        if ((navigator.userAgent.indexOf('iPhone') == -1) && (navigator.userAgent.indexOf('iPod') == -1) && (navigator.userAgent.indexOf('iPad') == -1)) {
            //只能在这里做，要不无法触发
            Utils.listen(document.body, 'keydown keyup keypress paste', this._firePharse.bind(this));
        }
    },
    _firePharse: function(e) {
        //        //只读模式下强了所有的事件操作
        //        if(this.readOnly === true){
        //            return false;
        //        }
        var beforeEvent, preEvent, executeEvent;

        if (e.type == 'DOMMouseScroll') {
            e.type = 'mousewheel';
            e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * -10;
            e.wheelDeltaX = e.originEvent.mozMovementX;
            e.wheelDeltaY = e.originEvent.mozMovementY;
        }

        beforeEvent = new MinderEvent('before' + e.type, e, true);
        if (this._fire(beforeEvent)) {
            return;
        }
        preEvent = new MinderEvent('pre' + e.type, e, true);
        executeEvent = new MinderEvent(e.type, e, true);

        if (this._fire(preEvent) ||
            this._fire(executeEvent))
            this._fire(new MinderEvent('after' + e.type, e, false));
    },
    _interactChange: function(e) {
        var me = this;
        if (me._interactScheduled) return;
        setTimeout(function() {
            me._fire(new MinderEvent('interactchange'));
            me._interactScheduled = false;
        }, 100);
        me._interactScheduled = true;
    },
    _listen: function(type, callback) {
        var callbacks = this._eventCallbacks[type] || (this._eventCallbacks[type] = []);
        callbacks.push(callback);
    },
    _fire: function(e) {


        var status = this.getStatus();

        var callbacks = this._eventCallbacks[e.type.toLowerCase()] || [];

        if (status) {

            callbacks = callbacks.concat(this._eventCallbacks[status + '.' + e.type.toLowerCase()] || []);
        }



        if (callbacks.length === 0) {
            return;
        }
        var lastStatus = this.getStatus();

        for (var i = 0; i < callbacks.length; i++) {

            callbacks[i].call(this, e);

            /* this.getStatus() != lastStatus ||*/
            if (e.shouldStopPropagationImmediately()) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function(name, callback) {
        var km = this;
        utils.each(name.split(/\s+/), function(i, n) {
            km._listen(n.toLowerCase(), callback);
        });
        return this;
    },
    off: function(name, callback) {

        var types = name.split(/\s+/);
        var i, j, callbacks, removeIndex;
        for (i = 0; i < types.length; i++) {

            callbacks = this._eventCallbacks[types[i].toLowerCase()];
            if (callbacks) {
                removeIndex = null;
                for (j = 0; j < callbacks.length; j++) {
                    if (callbacks[j] == callback) {
                        removeIndex = j;
                    }
                }
                if (removeIndex !== null) {
                    callbacks.splice(removeIndex, 1);
                }
            }
        }
    },
    fire: function(type, params) {
        var e = new MinderEvent(type, params);
        this._fire(e);
        return this;
    }
});