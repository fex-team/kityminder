var MinderEvent = kity.createClass( 'MindEvent', {
    constructor: function ( type, params, canstop ) {
        params = params || {};
        if ( params.getType && params.getType() == 'ShapeEvent' ) {
            this.kityEvent = params;
            this.originEvent = params.originEvent;
            this.getPosition = params.getPosition.bind( params );
        } else if ( params.target && params.preventDefault ) {
            this.originEvent = params;
        } else {
            kity.Utils.extend( this, params );
        }
        this.type = type;
        this._canstop = canstop || false;
    },

    getTargetNode: function () {
        var findShape = this.kityEvent && this.kityEvent.targetShape;
        if ( !findShape ) return null;
        while ( !findShape.minderNode && findShape.container ) {
            findShape = findShape.container;
        }
        return findShape.minderNode || null;
    },

    stopPropagation: function () {
        this._stoped = true;
    },

    stopPropagationImmediately: function () {
        this._immediatelyStoped = true;
        this._stoped = true;
    },

    shouldStopPropagation: function () {
        return this._canstop && this._stoped;
    },

    shouldStopPropagationImmediately: function () {
        return this._canstop && this._immediatelyStoped;
    },
    preventDefault:function(){
        this.originEvent.preventDefault();
    },
    isRightMB:function(){
        var isRightMB = false;
        if(!this.originEvent){
            return false;
        }
        if ("which" in this.originEvent)
            isRightMB = this.originEvent.which == 3;
        else if ("button" in this.originEvent)
            isRightMB = this.originEvent.button == 2;
        return isRightMB;
    }
} );