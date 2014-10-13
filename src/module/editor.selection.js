//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Path,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;
        this.setAttr('id','_kity_selection');
        this.width = 2;
        this.fill('rgb(27,171,255)');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5);
        this.setStyle('cursor','text');
        this._show = false;
        this.offset = [];
        this.setTranslate(-0.5, -1.5);
    },
    setMinderNode : function(node){
        this.minderNode = node;
    },
    setColor:function(color){

        this.fill(color);
    },
    updateOffsetByTextData:function(data,offset){
        if(this.collapsed){
            this.offset = utils.getValueByIndex(data,this.startOffset);
            return this;
        }else{
            var arrOffset = [],tmpOffset = {},
                startOffset = this.startOffset,
                endOffset = this.endOffset,
                cIndex = 0;

            utils.each(data,function(l,arr){
                tmpOffset = {
                    width:0,
                    x:0,
                    y:0
                };
                utils.each(arr,function(i,o){
                    if(cIndex >= startOffset && cIndex <= endOffset){
                        if(i === 0 || cIndex === startOffset){
                            tmpOffset.x = o.x;
                            tmpOffset.y = o.y;
                            tmpOffset.width =  o.width;
                            //i === 0 && offset && offset.x <= o.x && cIndex != startOffset ? 0 :
                        }else if(cIndex < endOffset){
                            tmpOffset.width += o.width;
                        }else if(cIndex === endOffset){
                            return false;
                        }

                    }
                    cIndex++;
                });
                if(tmpOffset.x !== undefined) {
                    arrOffset.push(tmpOffset);
                }
                if(cIndex === endOffset) {
                    return false;
                }
                if(arr.length == 1 && arr[0].width === 0)
                    return;

                cIndex++;

            });
            this.offset = arrOffset;
            return this;
        }
        this._show = true;
    },
    updatePosition: function(offset){
        var me = this;
        var r = Math.round;

        var rect = function (x, y, w, h) {
            return ['M', r(x), r(y),
                'h', r(w),
                'v', r(h),
                'h', -r(w),
                'v', -r(h),
                'z'];
        };

        offset = offset !== undefined ? offset : this.offset;

        if(this.collapsed){
            if (isNaN(offset.x) || isNaN(offset.y)) {
                if (console) console.warn('editor.selection.js 不正确的偏移位置');
                return this;
            }
            this.setPathData(rect(offset.x, offset.y, this.width, this.height));
        } else {
            this.setPathData(offset.reduce(function (prev, current) {
                return prev.concat(rect(current.x, current.y, current.width, me.height));
            }, []));
        }
        this._show = true;
        return this;
    },
    collapse : function(toStart){
        this.setOpacity(1);
        this.collapsed = true;
        if(toStart){
            this.endOffset = this.startOffset;

        }else{
            this.startOffset = this.endOffset;
        }
        return this;
    },
    setStartOffset:function(offset){
        this.startOffset = offset;
        if(this.startOffset >= this.endOffset){
            this.collapse(true);
            return this;
        }
        this.collapsed = false;
        this.setOpacity(0.5);
        return this;
    },
    setEndOffset:function(offset){
        this.endOffset = offset;
        if(this.endOffset <= this.startOffset){
           this.startOffset = offset;
           this.collapse(true);
            return this;
        }
        this.collapsed = false;
        this.setOpacity(0.5);
        return this;
    },
    update : function(data,offset){
        if(data){
            this.updateOffsetByTextData(data,offset);
        }
        this.updatePosition();
        this.setShow();
        return this;
    },
    setHeight: function ( height ) {
        this.height = Math.round(height) + 2;
        return this;
    },
    setHide: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', 'none' );
        this._show = false;
        return this;
    },
    setHoldShow:function(){
        this.setStyle('display','');
        clearInterval(this.timer);
        return this;
    },
    setShow: function () {
        this.bringTop();
        clearInterval( this.timer );
        var me = this,
            state = '';

        me.setStyle( 'display', '' );
        me._show = true;
        if(this.collapsed){
            me.setOpacity(1);
            this.timer = setInterval( function () {
                me.setStyle( 'display', state );
                state = state ? '' : 'none';
            }, 400 );
        }
        return this;
    },
    setShowStatus:function(){
        this._show = true;
        return this;
    },
    isShow:function(){
        return this._show;
    },
    isHide:function(){

        return !this._show;
    }
} );