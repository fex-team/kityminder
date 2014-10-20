//接收者
Minder.keyboarder = kity.createClass('keyboarder', function(){


    return {
        constructor: function(re) {
            this.re = re;
            this.container = re.container;
            this.selection = re.selection;
            this.range = re.range;
            this.km = re.km;
            this.lastMinderNode = null;
            this.isTypeText = false;
            this._initEvent();
            this.isShortcutCopyKey = false;
        },
        //给接受容器绑定事件
        _initEvent: function(){
            var me = this;
            if(browser.ipad) {
                utils.listen(this.container, 'keydown keypress keyup input', function(e) {
                    me._handleEvents.call(me, new MinderEvent(e.type == 'keyup' ? 'beforekeyup' : e.type, e));
                    if(e.type == 'keyup'){
                        if(me.km.getStatus() == 'normal'){
                            me.km.fire( 'keyup', e);
                        }
                    }

                });
            }
            this.km.on('inputready.beforekeyup ' +
                'inputready.beforekeydown ' +
                'textedit.beforekeyup ' +
                'normal.keydown ' +
                'normal.keyup ' +
                'textedit.beforekeydown ' +
                'textedit.keypress ' +
                'textedit.paste',
            utils.proxy(this._handleEvents, this));
        },
        _handleEvents:function(e){
            switch (e.type) {
                case 'input':
                    this._input(e);
                    break;
                case 'beforekeydown':
                    this._beforeKeydown(e);
                    break;
                case 'beforekeyup':
                    this._beforeKeyup(e);
                    break;
                case 'keyup':
                    this._keyup(e);
            }
        },
        _setTextToContainer : function(keyCode,iskeyUp){
            var me = this;
            //同步节点
            me.minderNode = me.re.minderNode;

            clearTimeout(me.timer);

            if (!me.range.hasNativeRange()) {
                return;
            }


            if(keymap.controlKeys[keyCode] && !iskeyUp ){
                return;
            }
            //当第一次输入内容时进行保存
            if(me.lastMinderNode !== me.minderNode && !keymap.notContentChange[keyCode]){
                me.km.fire('saveScene',{
                    inputStatus:true
                });
                me.lastMinderNode = me.minderNode;
            }

            var text = me.re.getTxtOfContainer();

//            //#46 修复在ff下定位到文字后方空格光标不移动问题
//            if (browser.gecko && /\s$/.test(text)) {
//                text += '\u200b';
//            }

            //重新渲染节点
            me.minderNode.setText(text);
            me.re.setContainerStyle();
            me.minderNode.getRenderContainer().bringTop();
            me.minderNode.render();

            //移动光标不做layout
            if(!keymap.notContentChange[keyCode]){
                clearTimeout(me.inputTextTimer);

                me.inputTextTimer = setTimeout(function(){
                    me.km.layout(300);
                },300);
            }


            me.re.updateTextOffsetData()
                .updateRange()
                .updateSelectionByRange();

            me.selection
                .updateOffsetByTextData(me.re.textData)
                .updatePosition();


            //当然inputready状态时，如果输入文字，节点内文本会被先选中然后再消失，体验不好
            if(me.km.getStatus() != 'inputready'){
                me.selection.setHoldShow();
            }


            me.timer = setTimeout(function() {
                if(me.selection.isShow()){
                    me.selection.setShow();

                }

            }, 200);
            me.km.setStatus('textedit');
        },
        _input:function(){
            var me = this;
            if (browser.ipad) {
                setTimeout(function() {
                    me._setTextToContainer();
                });
            }
        },
        _beforeKeydown:function(e){
            var me = this;
            var orgEvt = e.originEvent;
            var keyCode = orgEvt.keyCode;

            this.isTypeText = keyCode == 229 || keyCode === 0;

            switch (keyCode) {
                case keymap.Enter:
                    if(e.originEvent.shiftKey && me.selection.isShow()){
                        me._handlerEnterkey();
                        e.preventDefault();
                        return false;
                    };
                case keymap.Tab:
                case keymap.Insert:
                    if(this.selection.isShow()){
                        this.re.clear();
                        this.km.setStatus('inputready');
                        clearTimeout(me.inputTextTimer);
                        e.preventDefault();
                    }else{
                        this.km.setStatus('normal');
                        this.km.fire('contentchange');
                    }

                    return;
                case keymap.left:
                case keymap.right:
                case keymap.up:
                case keymap.down:
                case keymap.Backspace:
                case keymap.Del:
                case keymap['/']:
                case keymap.F2:
                case keymap.Insert:
                    if(this.selection.isHide()){
                        this.km.setStatus('normal');
                        return;
                    }
                    break;
                case keymap.Control:
                case keymap.Alt:
                case keymap.Cmd:

                    if(this.selection.isHide() && this.km.getStatus() != 'textedit' && this.km.getStatus() !='inputready'){
                        this.km.setStatus('normal');
                        return;
                    }

            }

            if (e.originEvent.ctrlKey || e.originEvent.metaKey) {

                //选中节点时的复制粘贴，要变成normal
                if(this.selection.isHide() && {
                    86:1,
                    88:1,
                    67:1
                }[keyCode]){
                    //修正在cvs方式下_keyup会把节点文字选中
                    this.isShortcutCopyKey = true;
                    this.km.setStatus('normal');
                    return;
                }

                //粘贴
                if (keyCode == keymap.v) {

                    setTimeout(function () {
                        me.range.updateNativeRange().insertNode($('<span>$$_kityminder_bookmark_$$</span>')[0]);
                        var brArr = [];
                        utils.each(me.container.getElementsByTagName('br'),function(i,br){
                            brArr.push(br);
                        });
                        utils.each(brArr,function(i,br){
                            var textNode = document.createTextNode('\n');
                            br.parentNode.insertBefore(textNode,br);
                            br.parentNode.removeChild(br);
                        });
                        var textContent = me.container.textContent.replace(/[\u200b\t\r]/g,'');
                        var index = textContent.indexOf('$$_kityminder_bookmark_$$');

                        me.re.setContainerTxt(textContent.replace('$$_kityminder_bookmark_$$',''));


                        me.range.setStartOffset(index).collapse(true).select();
                        me._setTextToContainer(keyCode);
                    },50);
                    return;
                }
                //剪切
                if (keyCode == keymap.x) {
                    setTimeout(function () {
                        me._setTextToContainer(keyCode);
                    },50);
                    return;
                }


            }

            this.isShortcutCopyKey = false;
            //针对不能连续删除做处理
            //if(keymap.Del  == keyCode || keymap.Backspace == keyCode)
            //    me._setTextToContainer(keyCode);

            me._setTextToContainer(keyCode);
        },
        _beforeKeyup:function(e){
            var me = this;
            var orgEvt = e.originEvent;
            var keyCode = orgEvt.keyCode;

            switch (keyCode) {
                case keymap.Enter:
                case keymap.Tab:
                case keymap.Insert:
                case keymap.F2:
                    if(browser.ipad){
                        if(this.selection.isShow()){
                            this.re.clear();
                            this.km.setStatus('inputready');
                            clearTimeout(me.inputTextTimer);
                            e.preventDefault();
                        }else{
                            this.km.setStatus('normal');
                            this.km.fire('contentchange');
                        }
                        return;
                    }

                    if (keymap.Enter == keyCode && (this.isTypeText || browser.mac && browser.gecko)) {
                        me._setTextToContainer(keyCode,true);
                    }
                    if (this.re.keydownNode === this.re.minderNode) {
                        this.km.rollbackStatus();
                        this.re.clear();
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
                    me._setTextToContainer(keyCode,true);
                    return;
            }

            if (this.isTypeText) {
                me._setTextToContainer(keyCode,true);
                return;
            }
            if (browser.mac && browser.gecko){
                me._setTextToContainer(keyCode,true);
                return;
            }

            me._setTextToContainer(keyCode,true);

            return true;
        },
        _keyup:function(e){
            var me = this;
            var timer;
            var node = this.km.getSelectedNode();
            if(this.km.getStatus() == 'normal' && node && this.selection.isHide()){

                if(this.isShortcutCopyKey){
                    return;
                }


                if (node && this.km.isSingleSelect() && node.isSelected()) {

                    this.re.updateByMinderNode(node);

                    this.selection.setHide()
                        .setStartOffset(0)
                        .setEndOffset(this.re.getTxtOfContainer().length)
                        .setColor( node.getStyle('text-selection-color'));

                    setTimeout(function(){
                        me.re.updateContainerRangeBySel();
                    });

                    if(browser.ie ){
                        timer = setInterval(function(){
                            var nativeRange = me.range.nativeSel.getRangeAt(0);
                            if(!nativeRange || nativeRange.collapsed){
                                me.range.select();
                            }else {
                                clearInterval(timer);
                            }
                        });
                    }

                    this.km.setStatus('inputready');

                }
            }
        },
        //处理软回车操作
        _handlerEnterkey:function(){
            function removeTmpTextNode(node){
                if(node && node.nodeType == 3 && node.nodeValue.length === 0){
                    node.parentNode.removeChild(node);
                }
            }
            var rng = this.range;
            var br = document.createElement('br');
            var me = this;
            if(!rng.collapsed){
                rng.deleteContents();
            }
            rng.insertNode(br);
            removeTmpTextNode(br.previousSibling);
            removeTmpTextNode(br.nextSibling);
            rng.setStartAfter(br);
            rng.collapse(true);

            var start = rng.startContainer.childNodes[rng.startOffset];
            if(!start){
                br = br.cloneNode(false);
                rng.startContainer.appendChild(br);
                rng.setStartBefore(br);
                rng.collapse(true);
            }


            rng.select();
            me._setTextToContainer(keymap.Enter);


        }

    };
}());