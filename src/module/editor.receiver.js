//接收者
Minder.Receiver = kity.createClass('Receiver',{
    clear : function(){
        this.container.innerHTML = '';
        this.index = 0;
        return this;
    },
    constructor : function(){
        var _div = document.createElement('div');
        _div.setAttribute('contenteditable',true);
        _div.className = 'km_receiver';
        this.container = document.body.insertBefore(_div,document.body.firstChild);
        utils.addCssRule('km_receiver_css',' .km_receiver{position:absolute;padding:0;margin:0;word-wrap:break-word;clip:rect(1em 1em 1em 1em);}');
        utils.listen(_div,'keydown keypress keyup', utils.proxy(this.keyboardEvents,this));
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
    keyboardEvents : function(e){
        clearTimeout(this.timer);
        var me = this;
        switch(e.type){
            case 'keyup':
                this.textShape.setContent((this.container.textContent || this.container.innerText).replace(/\u200b/g,''));
                this.updateTextData();
                this.updateCursor();
                this.timer = setTimeout(function(){
                    me.cursor.setShow()
                },500);
                break;
            case 'keypress':
            case 'keyup':
        }
    },
    updateTextData : function(){
        this.textShape.textData =  this.getTextOffsetData();
        this.index = this.index + 1;
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
    getTextOffsetData:function(){
        var text = this.textShape.getContent();
        this.textData = [];
//                this.textShape.clearContent();
        var containerOffset = this.textShape.container.getRenderBox();

        for(var i= 0,l = text.length;i<l;i++){
            var box = this.textShape.getExtentOfChar(i);
            this.textData.push({
                x:box.x + containerOffset.x,
                y:box.y + containerOffset.y,
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
        this.cursor.setHeight(this.getTextShapeHeight())
        return this;
    }
});