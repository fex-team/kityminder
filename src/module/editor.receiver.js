//接收者
Minder.Receiver = kity.createClass('Receiver',{
    clear : function(){
        this.container.innerHTML = '';
        this.selection.setHide();
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
        this.km.on('beforekeyup', utils.proxy(this.keyboardEvents,this));
        this.timer = null;
        this.index = 0;
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
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;
        switch(e.type){

            case 'beforekeyup':
                if(this.isTextEditStatus()){
                    switch(keyCode){
                        case keymap.Enter:
                        case keymap.Tab:
                            if(this.keydownNode === this.minderNode){
                                this.setTextEditStatus(false);
                                this.clear();
                            }
                            e.preventDefault();
                            return;
                        case keymap.Shift:
                        case keymap.Control:
                        case keymap.Alt:
                        case keymap.Cmd:
                            return;

                    }
                    var text = (this.container.textContent || this.container.innerText).replace(/\u200b/g,'');


                    this.textShape.setContent(text);
                    this.setContainerStyle();
                    this.minderNode.setText(text);

                    this.km.updateLayout(this.minderNode);
                    this.setBaseOffset();
                    this.updateTextData();
                    this.updateIndex();
                    this.updateSelection();

                    this.timer = setTimeout(function(){
                        me.selection.setShow()
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
    setSelection : function(selection){
        this.selection = selection;
        return this;
    },
    updateSelection : function(){
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset(this.index).collapse(true);
        if(this.index == this.textData.length){

            this.selection.setPosition({
                x : this.textData[this.index-1].x + this.textData[this.index-1].width,
                y : this.textData[this.index-1].y
            })
        }else{
            this.selection.setPosition(this.textData[this.index])
        }
        return this;
    },
    setBaseOffset :function(){

        var nodeOffset = this.minderNode.getRenderContainer().getRenderBox();
        var textOffset = this.textShape.getRenderBox();
        var transformed = this.textShape.container.getTransform().transformBox(textOffset);
        //var contRcOffset = this.minderNode.getContRc().getRenderBox();

        this.offset =   {
            x : nodeOffset.x +  transformed.x,
            y : nodeOffset.y +  transformed.y
        };
        return this;
    },
    setContainerStyle : function(){
        var textShapeBox = this.textShape.getRenderBox();

        this.container.style.cssText =  ";left:" + this.offset.x
            + 'px;top:' + (this.offset.y+textShapeBox.height)
            + 'px;width:' + textShapeBox.width
            + 'px;height:' + textShapeBox.height + 'px;';
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
            //点击开始之前
            if(i == 0 && offset.x <= v.x){
                me.index = 0;
                return false;
            }

            if(i == me.textData.length -1 && offset.x >= v.x){
                me.index = me.textData.length;
                return false;
            }
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
    setSelectionHeight:function(){
        this.selection.setHeight(this.getTextShapeHeight());
        return this;
    },

    updateSelectionByMousePosition:function(offset,dir){

        var me = this;
        utils.each(this.textData,function(i,v){
            //点击开始之前
            if(i == 0 && offset.x <= v.x){
                me.selection.setStartOffset(0);
                return false;
            }

            if(i == me.textData.length -1 && offset.x >= v.x){
                me.selection.setEndOffset(me.textData.length);
                return false;
            }
            if(offset.x >= v.x && offset.x <= v.x + v.width){

                if(me.index == i){
                    if(i == 0){
                        me.selection.setStartOffset(i)
                    }
                    me.selection.setEndOffset(i + (dir == 1 ? 1 : 0))
                }else if(i > me.index){
                    me.selection.setEndOffset(i + (dir == 1 ? 1 : 0))
                }else{
                    me.selection.setStartOffset(i + (dir == 1 ? 1 : 0))
                }

                return false;
            }
        });
        return this;
    },
    updateSelectionShow:function(){
        var startOffset = this.textData[this.selection.startOffset],
            endOffset = this.textData[this.selection.endOffset],
            width = 0 ;
        if(this.selection.collapsed){

            this.selection.updateShow(startOffset,0);
            return this;
        }
        if(!endOffset){
            var lastOffset = this.textData[this.textData.length -1];
            width = lastOffset.x - startOffset.x + lastOffset.width;
        }else{
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow(startOffset,width);
        return this;
    },
    updateRange:function(range){
        var node = this.container.firstChild;
        range.setStart(node,this.selection.startOffset);
        range.setEnd(node,this.selection.endOffset);
        range.select();
        return this;
    },
    setIndex:function(index){
        this.index = index;
        return this
    }
});