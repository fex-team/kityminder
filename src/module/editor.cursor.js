//模拟光标
Minder.Cursor = kity.createClass('Cursor',{
    base: kity.Line,
    constructor: function(height, color, width) {
        this.callBase();
        this.height = height || 20;
        this.stroke(color || 'blue',  width || 1);
        this.setHide();
        this.timer = null;
    },
    setPosition: function(offset) {
        try{
            this.setPoint1(offset.x,offset.y);
            this.setPoint2(offset.x,offset.y + this.height);
        }catch(e){
            debugger
        }
        return this;
    },
    setHeight:function(height){
        this.height = height;
    },
    setHide:function(){
        clearInterval(this.timer);
        this.setStyle('display','none');
        return this;
    },
    setShowHold : function(){
        clearInterval(this.timer);
        this.setStyle('display','');
        return this;
    },
    setShow:function(){
        clearInterval(this.timer);
        var me = this,
            state = '';
        this.timer = setInterval(function(){
            me.setStyle('display',state);
            state = state ? '' : 'none';
        },300);
        return this;
    },
    setTextShape:function(text){
        if(!text){
            this.text = new kity.Text();
        }else{
            this.text = text;
        }
        return this
    },
    getTextShape:function(){
        return this.text
    },
    setTxtContent : function(text){
        this.text.setContent(text)
    },
    updatePosition:function(index){

    }
});