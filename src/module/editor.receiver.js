//接收者
Minder.Receiver = kity.createClass('Receiver',{
    clear : function(){
        this.container.innerHTML = '';
        this.cursor.setHide();
        this.index = 0;
        return this;
    },
    setTextEditStatus : function(status){
        this.textEditStatus = status || false;
        return this;
    },
    isTextEditStatus:function(){
        return this.textEditStatus;
    },
    constructor : function(km){
        this.setKityMinder(km);
        this.textEditStatus = false;
        var _div = document.createElement('div');
        _div.setAttribute('contenteditable',true);
        _div.className = 'km_receiver';
        this.container = document.body.insertBefore(_div,document.body.firstChild);
        utils.addCssRule('km_receiver_css',' .km_receiver{position:absolute;padding:0;margin:0;word-wrap:break-word;clip:rect(1em 1em 1em 1em);}');//
//        utils.listen(_div,'keydown keypress keyup', utils.proxy(this.keyboardEvents,this));
        this.km.on('beforekeyup', utils.proxy(this.keyboardEvents,this));
        this.timer = null;
        this.index = 0;
    },
    setPosition : function(textShapeOffset){
        this.container.style.top = textShapeOffset.x + 'px';
        this.container.style.left = textShapeOffset.y + 'px';
        this.textShape.setPosition(textShapeOffset.x,textShapeOffset.y + this.textShape.getSize());
        return this;
    },
    setRange : function(range,index){

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart(text || this.container, this.index).collapse(true);
        setTimeout(function(){
            range.select()
        });
        return this;
    },
    setTextShape:function(textShape){
        if(!textShape){
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        this.container.innerHTML = textShape.getContent();
        return this;
    },
    setTextShapeSize:function(size){
        this.textShape.setSize(size);
        return this;
    },
    getTextShapeHeight:function(){
        return this.textShape.getRenderBox().height;
    },
    appendTextShapeToPaper:function(paper){
        paper.addShape(this.textShape);
        return this;
    },
    setKityMinder:function(km){
        this.km = km;
        return this;
    },
    setMinderNode:function(node){
        this.minderNode = node;
        return this;
    },
    keyboardEvents : function(e){

        clearTimeout(this.timer);
        var me = this;
        var keyCode = e.originEvent.keyCode;


        switch(e.type){

            case 'beforekeyup':
                if(this.isTextEditStatus()){
                    switch(keyCode){
                        case keymap.Enter:
                        case keymap.Tab:
                            this.setTextEditStatus(false);
                            this.clear();
                            e.stopPropagation();
                            return;
                    }



                    var text = (this.container.textContent || this.container.innerText).replace(/\u200b/g,'');
                    this.textShape.setContent(text);
                    this.setContainerStyle();
                    this.minderNode.setText(text);
                    this.km.renderNode(this.minderNode);
                    this.km.updateLayout(this.minderNode);
                    this.updateTextData();
                    this.updateIndex();
                    this.updateCursor();

                    this.timer = setTimeout(function(){
                        me.cursor.setShow()
                    },500);
                    return true;
                }

        }
    },
    updateIndex:function(){
        this.index = this.range.getStart().startOffset;
    },
    updateTextData : function(){
        this.textShape.textData =  this.getTextOffsetData();
    },
    setCursor : function(cursor){
        this.cursor = cursor;
        return this;
    },
    updateCursor : function(){
        this.cursor.setShowHold();
        if(this.index == this.textData.length){

            this.cursor.setPosition({
                x : this.textData[this.index-1].x + this.textData[this.index-1].width,
                y : this.textData[this.index-1].y
            })
        }else if(this.index == 0){
            this.cursor.setPosition({
                x : this.textShape.getX(),
                y : this.textShape.getY()
            })
        }else{
            if(this.index + 1 == this.textData.length){
                var lastChar = this.textData[this.index];
                this.cursor.setPosition({
                    x : lastChar.x + lastChar.width,
                    y : lastChar.y
                })
            }else{
                this.cursor.setPosition(this.textData[this.index])
            }

        }
        return this;
    },
    setBaseOffset :function(){

        var nodeOffset = this.minderNode.getRenderContainer().getRenderBox();
        var textOffset = this.textShape.getRenderBox();

        this.offset =   {
            x : nodeOffset.x + textOffset.x,
            y : nodeOffset.y + textOffset.y
        };
        return this;
    },
    setContainerStyle : function(){
        var textShapeBox = this.textShape.getRenderBox();
        var size = this.textShape.getSize();
        this.container.style.cssText += ";left:" + this.offset.x
            + 'px;top:' + (this.offset.y + size)
            + 'px;width:' + textShapeBox.width
            + 'px;height:' + textShapeBox.height + 'px;font-size:' + size + 'px';
        return this;
    },
    getTextOffsetData:function(){
        var text = this.textShape.getContent();
        this.textData = [];

        for(var i= 0,l = text.length;i<l;i++){
            var box = this.textShape.getExtentOfChar(i);
            this.textData.push({
                x:box.x + this.offset.x,
                y:this.offset.y,
                width:box.width,
                height:box.height
            })
        }


        return this;
    },
    setCurrentIndex:function(offset){
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        utils.each(this.textData,function(i,v){
            if(offset.x >= v.x && offset.x <= v.x + v.width){
                if(offset.x  - v.x > v.width/2){
                    me.index = i + 1;

                }else {
                    me.index = i

                }
                hadChanged = true;
                return false;
            }
        });
        return this;

    },
    setCursorHeight:function(){
        this.cursor.setHeight(this.getTextShapeHeight());
        return this;
    }
});