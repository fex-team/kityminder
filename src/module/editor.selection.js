//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Rect,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;

        this.stroke( color || 'rgb(27,171,255)', width || 1 );
        this.width = 0;
        this.fill('rgb(27,171,255)');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5);
        this.setStyle('cursor','text');
    },
    collapse : function(toEnd){

        this.stroke( 'rgb(27,171,255)', 1 );
        this.setOpacity(1);
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
        this.stroke('none',0);
        this.setOpacity(0.5);
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
        this.stroke('none',0);
        this.setOpacity(0.5);
        return this;
    },
    updateShow : function(offset,width){
        if(width){
            this.setShowHold();
        }
        this.setPosition(offset).setWidth(width);
        //解决在框选内容时，出现很窄的光标
        if(width == 0){
            this.setOpacity(0);
        }else{
            this.setOpacity(0.5);
        }
        return this;
    },
    setPosition: function ( offset ) {
        try {
            this.x = offset.x;
            this.y = offset.y;

        } catch ( e ) {
           console.log(e)
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
        me.setStyle( 'display', '' );
        if(this.collapsed){
            this.timer = setInterval( function () {
                me.setStyle( 'display', state );
                state = state ? '' : 'none';
            }, 400 );
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