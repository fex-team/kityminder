var MinderEvent = kity.createClass('MindEvent', {
    constructor: function (type, params, cancelable) {
        params = params || {};
        if(params.getType && params.getType() == 'ShapeEvent') {
            this.kityEvent = params;
            this.getPosition = params.getPosition.bind(params);
        } else {
            kity.Utils.extend(this, params);
        }
        this.type = type;
        this._cancelable = cancelable || false;
        if(params.targetShape) {
            this.getTargetNode = function() {
                var findShape = params.targetShape;
                while(!findShape.minderNode && findShape.container) {
                    findShape = findShape.container;
                }
                return findShape.minderNode || null;
            };
        }
    },

    cancel: function() {
        this._canceled = true;
    },

    cancelImmediately: function() {
        this._immediatelyCanceld = true;
        this._canceled = true;
    },

    shouldCancel: function() {
        return this._cancelable && this._canceled;
    },

    shouldCancelImmediately: function() {
        return this._cancelable && this._immediatelyCanceld;
    }
});