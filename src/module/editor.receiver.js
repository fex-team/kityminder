//接收者
Minder.Receiver = kity.createClass('Receiver', {
    clear: function() {
        this.container.innerHTML = '';
        if (this.selection) {
            this.selection.setHide();
        }
        if (this.range) {
            this.range.clear();
        }
        this.index = 0;


        return this;
    },
    constructor: function(km,sel,range) {
        //初始化接收者
        this.setKityMinder(km);

        //创建接收者容器
        var _div = document.createElement('div');
        _div.setAttribute('contenteditable', true);
        _div.className = 'km_receiver';
        this.container = _div;
        utils.addCssRule('km_receiver_css',
            ' .km_receiver{white-space:nowrap;position:absolute;padding:0;margin:0;word-wrap:break-word;'
                + (/\?debug#?/.test(location.href)?'':'clip:rect(1em 1em 1em 1em);'));

        this.index = 0;
        this.selection = sel;
        this.range = range;

        this.range.container = _div;
    },
    setRange: function(range, index) {

        this.index = index || this.index;

        this.range = range;


        range.setStartOffset(this.index);
        range.collapse(true);
        var me = this;

        setTimeout(function() {
            me.container.focus();
            range.select();
        });
        return this;
    },
    setTextGroup: function(textGroup) {
        this.textGroup = textGroup;
        return this;
    },

    setKityMinder: function(km) {
        this.km = km;
        return this;
    },

    updateByMinderNode:function(node){
        this.setMinderNode(node);
        //追加selection到节点
        this._addSelection();
        //更新minderNode下的textGroup
        this.setTextGroup(node.getTextGroup());
        //更新接受容器的样式
        this.setContainerStyle();
        //更新textOffsetData数据
        this.updateTextOffsetData();
        //更新选取高度
        this.setSelectionHeight();
        //更新接收容器内容
        this.setContainerTxt();
        return this;
    },
    setMinderNode: function(node) {
        this.minderNode = node;
        this.selection.setMinderNode(node);
        return this;
    },
    _addSelection:function(){
        if (this.selection.container){
            this.selection.remove();
        }

        this.minderNode.getRenderContainer().addShape(this.selection);
        return this;
    },
    getMinderNode:function(){
        return this.minderNode;
    },
    
    updateIndex: function() {
        this.index = this.range.getStartOffset();
        return this;
    },

    setSelection: function(selection) {
        this.selection = selection;
        return this;
    },
    updateSelection: function(offset) {
        this.selection.update(this.textData,offset);
        return this;
    },
    getOffsetByIndex:function(index){
        return utils.getValueByIndex(this.textData, index !== undefined ? index : this.index);
    },
    getBaseOffset: function() {
        var offset = this.textGroup.getRenderBox('screen');
        return offset;
    },
    setContainerStyle: function() {
        var textGroupBox = this.getBaseOffset();
        this.container.style.cssText = ';left:' + (browser.ipad ? '-' : '') +
            textGroupBox.x + 'px;top:' + (textGroupBox.y + (/\?debug#?/.test(location.href)?this.textGroup.getItems().length * this.getlineHeight():0)) +
            'px;width:' + textGroupBox.width + 'px;height:' + textGroupBox.height + 'px;';

        return this;
    },
    updateTextOffsetData: function() {
        var me = this;

        var fontHeight = this.minderNode.getData('font-size') || this.minderNode.getStyle('font-size');
        var lineHeight = this.minderNode.getStyle('line-height') * fontHeight;

        var offsetHeight = (me.textGroup.getShapes().length * lineHeight - (lineHeight - fontHeight)) / 2;

        var box;
        this.textData = [];

        me.textGroup.eachItem(function(index,textShape){
            me.textData[index] = [];
            var currentLineTop = index * lineHeight + 1;
            var text = textShape.getContent();

            for (var i = 0, l = text.length; i < l; i++) {
                try {
                    box = textShape.getExtentOfChar(i);
                } catch (e) {
                    console.log(e);
                }
                me.textData[index].push({
                    x: box.x ,
                    y: currentLineTop - offsetHeight,
                    width: box.width,
                    height: box.height
                });
            }
            if(text.length === 0){
                me.textData[index].push({
                    x: 0,
                    y: currentLineTop - offsetHeight,
                    width: 0,
                    height:lineHeight
                });
            }
        });
        return this;
    },
    getlineHeight:function(){
        return this.minderNode.getStyle('line-height') * (this.minderNode.getData('font-size') || this.minderNode.getStyle('font-size'));
    },
    updateIndexByMouse : function(offset) {

        var me = this;
        //更新文本字符坐标
        me.updateTextOffsetData();

        this.index = 0;

        var lineHeight = this.getlineHeight();


        utils.each(this.textData,function(l,arr){

            var first = arr[0];

            //确定行号
            if(first.y <= offset.y && first.y + lineHeight >= offset.y){

                utils.each(arr,function(i,v){
                    //点击开始之前
                    if (i === 0 && offset.x <= v.x) {

                        return false;
                    }
                    if (offset.x >= v.x && offset.x <= v.x + v.width) {
                        if (offset.x - v.x > v.width / 2) {
                            me.index += i + 1;
                        } else {
                            me.index += i;
                        }
                        return false;
                    }
                    if (i == arr.length - 1 && offset.x >= v.x) {

                        me.index += (arr.length == 1 && arr[0].width === 0 ? 0 : arr.length);
                        return false;
                    }
                });
                return false;
            }else{

                me.index += arr.length + (arr.length == 1 && arr[0].width === 0 ? 0 : 1);
                return;
            }

        });

        this.selection.setStartOffset(this.index).collapse(true);

        return this;

    },
    setSelectionHeight: function() {

        this.selection.setHeight((this.minderNode.getData('font-size') || this.minderNode.getStyle('font-size')) * 1);
        return this;
    },
    updateSelectionByMousePosition: function(offset) {

        var me = this;
        var result = 0;
        var lineHeight =  this.getlineHeight();
        utils.each(this.textData,function(l,arr){
            var first = arr[0];
            //确定行号

            if(first.y <= offset.y && first.y  + lineHeight >= offset.y){

                utils.each(arr,function(i,v){
                    //点击开始之前
                    if (i === 0 && offset.x <= v.x) {
                        return false;
                    }
                    if (offset.x >= v.x && offset.x <= v.x + v.width) {

                        result += i;
                        if (offset.x - v.x > v.width / 2) {
                            result += 1;
                        }

                        return false;
                    }
                    if (i == arr.length - 1 && offset.x >= v.x) {

                        result += (arr.length == 1 && arr[0].width === 0 ? 0 : arr.length);

                        return false;
                    }
                });

                return false;
            }else{

                if(first.y > offset.y && l === 0){
                    result = 0;
                    return false;
                }else if(l == me.textData.length - 1 && first.y  + lineHeight < offset.y){
                    result += arr.length + 1;
                    return false;
                }
                result += arr.length + (arr.length == 1 && arr[0].width === 0 ? 0 : 1);
                return;
            }

        });
        if(result < me.index){
            this.selection.setStartOffset(result);
            this.selection.setEndOffset(me.index);

        }else if(result == me.index){

            this.selection.setStartOffset(result).collapse(true);
        }else{
            this.selection.setStartOffset(me.index);
            this.selection.setEndOffset(result);
        }
        return this;
    },

    updateRange: function() {
        this.range.update();
        return this;
    },
    updateContainerRangeBySel:function(){
        var me = this;
        this.range.setStartOffset(this.selection.startOffset);
        this.range.setEndOffset(this.selection.endOffset);

        if(browser.gecko){
            this.container.focus();
            setTimeout(function(){
                me.range.select();
            });
        }else{
            this.range.select();
        }
        return this;
    },
    updateSelectionByRange:function(){
        this.selection.setStartOffset(this.range.getStartOffset());
        this.selection.setEndOffset(this.range.getEndOffset());
        return this;
    },
    setIndex: function(index) {
        this.index = index;
        return this;
    },
    setContainerTxt: function(txt) {

        if(txt){
            txt = txt.replace(/[\n]/g,'<br\/>');
        }else{
            txt = '';
            this.textGroup.eachItem(function(i,item){
                txt += item.getContent() + '<br/>';
            });

        }
        this.container.innerHTML = txt;
        return this;
    },
    setReady:function(){
        this._ready = true;
    },
    clearReady:function(){
        this._ready = false;
    },
    isReady:function(){
        return this._ready;
    },
    focus:function(){
        this.container.focus();
    },
    getTxtOfContainer:function(){
        var result = '',cont = this.container;
        utils.each(cont.childNodes,function(i,n){
            if(n.nodeType == 3){
                result += n.nodeValue.replace(/[\u200b]/g, '');
            }else{
                if(n !== cont.lastChild)
                    result += '\n';
            }
        });
        return result;
    }
});