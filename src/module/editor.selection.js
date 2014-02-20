//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Rect,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;

        this.stroke( color || 'blue', width || 1 );
        this.width = 1;
        this.fill('#99C8FF');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5);
        this.setStyle('cursor','text');
    },
    collapse : function(toEnd){

        this.stroke( 'blue', 1 );
        this.width = 1;
        this.collapsed = true;
        if(toEnd){
            this.startOffset = this.endOffset
        }else{
            this.endOffset = this.startOffset;
        }
        return this;
    },
    setStartOffset:function(offset){
        this.startOffset = offset;
        var tmpOffset = this.startOffset;
        if(this.startOffset > this.endOffset){
            this.startOffset = this.endOffset;
            this.endOffset = tmpOffset;
        }else if(this.startOffset == this.endOffset){
            this.collapse();
            return this;
        }
        this.collapsed = false;
        this.stroke('none');
        return this;
    },
    setEndOffset:function(offset){
        this.endOffset = offset;
        var tmpOffset = this.endOffset;
        if(this.endOffset < this.startOffset){
            this.endOffset = this.startOffset;
            this.startOffset = tmpOffset;
        }else if(this.startOffset == this.endOffset){
            this.collapse();
            return this;
        }
        this.collapsed = false;
        this.stroke('none');
        return this;
    },
    updateShow : function(offset,width){
        this.setPosition(offset).setWidth(width);
        return this;
    },
    setPosition: function ( offset ) {
        try {
            this.x = offset.x;
            this.y = offset.y;

        } catch ( e ) {
           debugger
        }

        return this.update();
    },
    setHeight: function ( height ) {
        this.height = height;
    },
    setHide: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', 'none' );
        return this;
    },
    setShowHold: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', '' );
        return this;
    },
    setShow: function () {
        clearInterval( this.timer );
        var me = this,
            state = '';
        if(this.collapsed){
            this.timer = setInterval( function () {
                me.setStyle( 'display', state );
                state = state ? '' : 'none';
            }, 300 );
        }else{
            me.setStyle( 'display', '' );
        }

        return this;
    },
    setTextShape: function ( text ) {
        if ( !text ) {
            this.text = new kity.Text();
        } else {
            this.text = text;
        }
        return this
    },
    getTextShape: function () {
        return this.text
    },
    setTxtContent: function ( text ) {
        this.text.setContent( text )
    },
    updatePosition: function ( index ) {

    }
} );