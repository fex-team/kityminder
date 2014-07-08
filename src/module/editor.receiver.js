//接收者
Minder.Receiver = kity.createClass('Receiver', {
    clear: function() {
        this.container.innerHTML = '';
        if (this.selection) {
            this.selection.setHide();
        }
        if (this.range) {
            this.range.nativeSel.removeAllRanges();
        }
        this.index = 0;
        this.isTypeText = false;
        this.lastMinderNode = null;
        return this;
    },
    constructor: function(km,sel,range) {
        var me = this;
        this.setKityMinder(km);

        var _div = document.createElement('div');
        _div.setAttribute('contenteditable', true);
        _div.className = 'km_receiver';

        this.container = _div;

        if(browser.ipad) {
            utils.listen(this.container, 'keydown keypress keyup input', function(e) {
                me.keyboardEvents.call(me, new MinderEvent(e.type == 'keyup' ? 'beforekeyup' : e.type, e));
                if(e.type == 'keyup'){
                    if(me.km.getStatus() == 'normal'){
                        me.km.fire( 'keyup', e);
                    }

                }

            });
        }
        utils.addCssRule('km_receiver_css', ' .km_receiver{white-space:nowrap;position:absolute;padding:0;margin:0;word-wrap:break-word;' + (/\?debug$/.test(location.href)?'':'clip:rect(1em 1em 1em 1em);'));
        this.km.on('inputready.beforekeyup inputready.beforekeydown textedit.beforekeyup textedit.beforekeydown textedit.keypress textedit.paste', utils.proxy(this.keyboardEvents, this));
        this.timer = null;
        this.index = 0;
        this.selection = sel;
        this.range = range;
    },
    setRange: function(range, index) {

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart(text || this.container, this.index).collapse(true);
        var me = this;

        setTimeout(function() {
            me.container.focus();
            range.select();
        });
        return this;
    },
    setTextShape: function(textShape) {
        if (!textShape) {
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        // techird: add cache
        if (textShape._lastContent != textShape.getContent()) {
            this.container.innerHTML = utils.unhtml(textShape.getContent());
            textShape._lastContent = textShape.getContent();
        }
        return this;
    },
    setTextShapeSize: function(size) {
        this.textShape.setSize(size);
        return this;
    },
    getTextShapeHeight: function() {
        return this.textShape.getRenderBox().height;
    },
    setKityMinder: function(km) {
        this.km = km;
        return this;
    },
    setMinderNode: function(node) {
        this.minderNode = node;
        //追加selection到节点
        this._addSelection();
        //更新minderNode下的textshape
        this.setTextShape(node.getTextShape());
        //更新textshape的baseOffset
        this.setBaseOffset();
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
    _addSelection:function(){
        if (this.selection.container) this.selection.remove();
        this.minderNode.getRenderContainer().addShape(this.selection);
    },
    getMinderNode:function(){
        return this.minderNode;
    },
    keyboardEvents: function(e) {


        var me = this;
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;

        function setTextToContainer(keyCode) {
            clearTimeout(me.timer);
            if (!me.range.hasNativeRange()) {
                return;
            }
            //当第一次输入内容时进行保存
            if(me.lastMinderNode !== me.minderNode){
                me.km.fire('saveScene',{
                    inputStatus:true
                });
                me.lastMinderNode = me.minderNode;
            }
            var text = me.container.textContent.replace(/[\u200b\t\r\n]/g, '');

            if (me.textShape.getOpacity() === 0) {
                me.textShape.setOpacity(1);
            }
            //#46 修复在ff下定位到文字后方空格光标不移动问题
            if (browser.gecko && /\s$/.test(text)) {
                text += '\u200b';
            }

            if (text.length === 0) {

                me.minderNode.setTmpData('_lastTextContent',me.textShape.getContent());
                me.minderNode.setText('a');
            }else {
                me.minderNode.setText(text);
            }


            me.setContainerStyle();
            me.minderNode.getRenderContainer().bringTop();
            me.minderNode.render();
            //移动光标不做layout
            if(!keymap.direction[keyCode] && !orgEvt.shiftKey && !orgEvt.metaKey && !orgEvt.ctrlKey){
                clearTimeout(me.inputTextTimer);

                me.inputTextTimer = setTimeout(function(){
                    me.km.layout(300);
                },250);
            }


            me.textShape = me.minderNode.getRenderer('TextRenderer').getRenderShape();
            if (text.length === 0) {
                me.textShape.setOpacity(0);
            }
            me.setBaseOffset();
            me.updateTextOffsetData();
            me.updateIndex();
            me.updateSelection();
            me.timer = setTimeout(function() {
                me.selection.setShow();
            }, 200);

            me.km.setStatus('textedit');
            me.selection.clearBaseOffset();
        }

        function restoreTextContent(){
            if(me.minderNode){
                var textShape = me.minderNode.getTextShape();
                if(textShape && textShape.getOpacity() === 0){
                    me.minderNode.setText(me.minderNode.getTmpData('_lastTextContent'));
                    me.minderNode.render();
                    me.minderNode.getTextShape().setOpacity(1);
                    me.km.layout(300);
                }

            }
        }
        switch (e.type) {

            case 'input':
                if (browser.ipad) {
                    setTimeout(function() {
                        setTextToContainer();
                    });
                }
                break;

            case 'beforekeydown':
                this.isTypeText = keyCode == 229 || keyCode === 0;

                switch (keyCode) {
                    case keymap.Enter:
                    case keymap.Tab:
                        if(this.selection.isShow()){
                            this.clear();
                            this.km.setStatus('inputready');
                            clearTimeout(me.inputTextTimer);
                            e.preventDefault();
                        }else{
                            this.km.setStatus('normal');
                            this.km.fire('contentchange');
                        }
                        restoreTextContent();
                        return;
                    case keymap.left:
                    case keymap.right:
                    case keymap.up:
                    case keymap.down:
                        if(this.selection.isHide()){
                            restoreTextContent();
                            this.km.setStatus('normal');
                            return;
                        }
                        if(!orgEvt.shiftKey){
                            this.selection.baseOffset =
                            this.selection.currentEndOffset = null;
                        }
                        break;
                   // case keymap.Shift:
                    case keymap.Control:
                    case keymap.Alt:
                    case keymap.Cmd:
                    case keymap.F2:
//                    case keymap.Del:
//                    case keymap.Backspace:

                        if(this.selection.isHide()){
                            this.km.setStatus('normal');
                            return;
                        }

                }
                //针对按住shift+方向键进行处理
                if(orgEvt.shiftKey && keymap.direction[keyCode] && this.selection.isShow()){
                    if(this.selection.baseOffset === null){
                        this.selection.baseOffset = this.selection.startOffset;
                        this.selection.currentEndOffset = this.selection.endOffset;
                    }
                    var textlength = this.textShape.getContent().length;
                    if(keymap.right  == keyCode ){
                        this.selection.currentEndOffset++;
                        if(this.selection.currentEndOffset > textlength){
                            this.selection.currentEndOffset = textlength;
                        }

                    }else if(keymap.left == keyCode){
                        this.selection.currentEndOffset--;
                        if(this.selection.currentEndOffset < 0){
                            this.selection.currentEndOffset = 0;
                        }

                    }else if(keymap.up == keyCode){
                        this.selection.currentEndOffset = 0;
                        this.selection.baseOffset = this.selection.endOffset;
                    }else{
                        this.selection.currentEndOffset = textlength;
                    }

                    if(this.selection.currentEndOffset >= this.selection.baseOffset){
                        this.selection.setEndOffset(this.selection.currentEndOffset);
                        if(this.selection.currentEndOffset == this.selection.baseOffset){
                            this.selection.setStartOffset(this.selection.baseOffset);
                        }
                    }else{
                        this.selection.setStartOffset(this.selection.currentEndOffset);
                        this.selection.setEndOffset(this.selection.baseOffset);
                    }

                    this.updateContainerRangeBySel();

                    this.updateSelectionShow();

                    e.preventDefault();
                    return;
                }else if(keymap.direction[keyCode]){
                    this.selection.baseOffset =
                    this.selection.currentEndOffset = null;
                }

                if((e.originEvent.ctrlKey || e.originEvent.metaKey) && keymap.direction[keyCode] && this.selection.isShow()){

                    var textlength = this.textShape.getContent().length;
                    if(keymap.right  == keyCode ){
                        this.selection.setStartOffset(textlength).collapse(true);
                    }else if(keymap.left == keyCode){
                        this.selection.setStartOffset(0).collapse(true);
                    }else{
                        e.preventDefault();
                        return;
                    }

                    this.selection.baseOffset =
                    this.selection.currentEndOffset = null;
                    this.updateContainerRangeBySel();
                    this.updateSelectionShow();
                    e.preventDefault();
                    return;
                }
                if (e.originEvent.ctrlKey || e.originEvent.metaKey) {

                    //粘贴
                    if (keyCode == keymap.v) {

                        setTimeout(function() {
                            me.range.updateNativeRange().insertNode($('<span>$$_kityminder_bookmark_$$</span>')[0]);
                            me.container.innerHTML = utils.unhtml(me.container.textContent.replace(/[\u200b\t\r\n]/g, ''));
                            var index = me.container.textContent.indexOf('$$_kityminder_bookmark_$$');
                            me.container.textContent = me.container.textContent.replace('$$_kityminder_bookmark_$$', '');
                            me.range.setStart(me.container.firstChild, index).collapse(true).select();
                            setTextToContainer(keyCode);
                        }, 100);
                        return;
                    }
                    //剪切
                    if (keyCode == keymap.x) {
                        setTimeout(function() {
                            setTextToContainer(keyCode);
                        }, 100);
                        return;
                    }
                    //全选键位监控
                    if (keymap.a == keyCode) {
                        if(me.selection.isHide()){
                            return;
                        }else{
                            me.selection
                                .setStartOffset(0)
                                .setEndOffset(me.textShape.getContent().length);
                            me.updateContainerRangeBySel().updateSelectionShow();
                            return;
                        }
                    }


                }


                //针对不能连续删除做处理
                if(keymap.Del || keymap.Backspace)
                    setTextToContainer(keyCode);
                break;

            case 'beforekeyup':
                switch (keyCode) {
                    case keymap.Enter:
                    case keymap.Tab:
                    case keymap.F2:
                        if(browser.ipad){
                            if(this.selection.isShow()){
                                this.clear();
                                this.km.setStatus('inputready');
                                clearTimeout(me.inputTextTimer);
                                e.preventDefault();
                            }else{
                                this.km.setStatus('normal');
                                this.km.fire('contentchange');
                            }
                            restoreTextContent();
                            return;
                        }
                        if (keymap.Enter == keyCode && (this.isTypeText || browser.mac && browser.gecko)) {
                            setTextToContainer(keyCode);
                        }
                        if (this.keydownNode === this.minderNode) {
                            this.rollbackStatus();
                            this.clear();
                        }
                        e.preventDefault();
                        return;
                    case keymap.Del:
                    case keymap.Backspace:
                    case keymap.Spacebar:
                        if(browser.ipad){
                            if(this.selection.isHide()){
                                this.km.setStatus('normal');
                                return;
                            }

                        }
                        setTextToContainer(keyCode);
                        return;
                }
                if (this.isTypeText) {
                    setTextToContainer(keyCode);
                    return;
                }
                if (browser.mac && browser.gecko){
                    setTextToContainer(keyCode);
                    return;
                }
                if(this.selection.baseOffset === null && this.selection.collapsed)
                    setTextToContainer(keyCode);
                return true;
        }

    },

    updateIndex: function() {
        this.index = this.range.getStart().startOffset;
        return this;
    },
    updateTextOffsetData: function() {
        this.textShape.textData = this.getTextOffsetData();
        return this;
    },
    setSelection: function(selection) {
        this.selection = selection;
        return this;
    },
    updateSelection: function() {
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset(this.index).collapse(true);
        if (this.index == this.textData.length) {
            if (this.index === 0) {
                this.selection.setPosition(this.getBaseOffset());
            } else {
                this.selection.setPosition({
                    x: this.textData[this.index - 1].x + this.textData[this.index - 1].width,
                    y: this.textData[this.index - 1].y
                });
            }


        } else {
            this.selection.setPosition(this.textData[this.index]);
        }
        return this;
    },
    getBaseOffset: function(refer) {
        return this.textShape.getRenderBox(refer || this.km.getRenderContainer());
    },
    setBaseOffset: function() {
        this.offset = this.textShape.getRenderBox(this.km.getRenderContainer());
        return this;
    },
    setContainerStyle: function() {
        var textShapeBox = this.getBaseOffset('screen');
        this.container.style.cssText = ';left:' + (browser.ipad ? '-' : '') +
            textShapeBox.x + 'px;top:' + (textShapeBox.y + (/\?debug$/.test(location.href)?30:0)) +
            'px;width:' + textShapeBox.width + 'px;height:' + textShapeBox.height + 'px;';

        return this;
    },
    getTextOffsetData: function() {
        var text = this.textShape.getContent();
        var box;
        this.textData = [];

        for (var i = 0, l = text.length; i < l; i++) {
            try {
                box = this.textShape.getExtentOfChar(i);
            } catch (e) {
                console.log(e);
            }

            this.textData.push({
                x: box.x ,
                y: box.y,
                width: box.width,
                height: box.height
            });
        }
        return this;
    },
    setCurrentIndex: function(offset) {
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        //要剪掉基数
        this._getRelativeValue(offset);
        utils.each(this.textData, function(i, v) {
            //点击开始之前
            if (i === 0 && offset.x <= v.x) {
                me.index = 0;
                return false;
            }
            if (offset.x >= v.x && offset.x <= v.x + v.width) {
                if (offset.x - v.x > v.width / 2) {
                    me.index = i + 1;

                } else {
                    me.index = i;

                }
                hadChanged = true;
                return false;
            }
            if (i == me.textData.length - 1 && offset.x >= v.x) {
                me.index = me.textData.length;
                return false;
            }
        });

        return this;

    },
    setSelectionHeight: function() {
        this.selection.setHeight(this.getTextShapeHeight());
        return this;
    },
    _getRelativeValue:function(offset){
        offset.x = offset.x - this.offset.x;
        offset.y = offset.y - this.offset.y;
    },
    updateSelectionByMousePosition: function(offset, dir) {
        //要剪掉基数
        this._getRelativeValue(offset);
        var me = this;
        utils.each(this.textData, function(i, v) {
            //点击开始之前
            if (i === 0 && offset.x <= v.x) {
                me.selection.setStartOffset(0);
                return false;
            }

            if (i == me.textData.length - 1 && offset.x >= v.x) {
                me.selection.setEndOffset(me.textData.length);
                return false;
            }
            if (offset.x >= v.x && offset.x <= v.x + v.width) {

                if (me.index == i) {
                    if (i === 0) {
                        me.selection.setStartOffset(i);
                    }
                    if (offset.x <= v.x + v.width / 2) {
                        me.selection.collapse(true);
                    } else {
                        me.selection.setEndOffset(i + ((me.selection.endOffset > i ||
                            dir == 1) && i != me.textData.length - 1 ? 1 : 0));
                    }

                } else if (i > me.index) {
                    me.selection.setStartOffset(me.index);
                    me.selection.setEndOffset(i + 1);
                } else {
                    if (dir == 1) {
                        me.selection.setStartOffset(i + (offset.x >= v.x + v.width / 2 &&
                            i != me.textData.length - 1 ? 1 : 0));
                    } else {
                        me.selection.setStartOffset(i);
                    }

                    me.selection.setEndOffset(me.index);
                }

                return false;
            }
        });
        return this;
    },
    updateSelectionShow: function() {
        var startOffset = this.textData[this.selection.startOffset],
            endOffset = this.textData[this.selection.endOffset],
            width = 0;
        if (this.selection.collapsed) {
            if(startOffset === undefined){

                var tmpOffset = this.textData[this.textData.length - 1];
                tmpOffset = utils.clone(tmpOffset);
                tmpOffset.x = tmpOffset.x + tmpOffset.width;
                startOffset = tmpOffset;
            }
            this.selection.updateShow(startOffset, 2);
            return this;
        }
        if (!endOffset) {
            try {
                var lastOffset = this.textData[this.textData.length - 1];
                width = lastOffset.x - startOffset.x + lastOffset.width;
            } catch (e) {
                console.log(e);
            }

        } else {
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow(startOffset, width);
        return this;
    },
    updateRange: function(range) {
        range = range || this.range;
        var node = this.container.firstChild;
        range.setStart(node, this.selection.startOffset);
        range.setEnd(node, this.selection.endOffset);
        if(browser.gecko){
            this.container.focus();
            setTimeout(function(){
                range.select();
            });
        }else{
            range.select();
        }
        return this;
    },
    updateContainerRangeBySel:function(){
       return this.updateRange(this.range);
    },
    setIndex: function(index) {
        this.index = index;
        return this;
    },
    setContainerTxt: function(txt) {
        this.container.textContent = txt || this.textShape.getContent();
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
    }
});