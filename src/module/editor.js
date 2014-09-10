/* global Renderer: true */

KityMinder.registerModule('TextEditModule', function() {
    var km = this;
    var sel = new Minder.Selection();
    var range = new Minder.Range();
    var receiver = new Minder.Receiver(this,sel,range);
    var keyboarder = new Minder.keyboarder(receiver);

    this.receiver = receiver;

    //鼠标被点击，并未太抬起时为真
    var mouseDownStatus = false;


    //当前是否有选区存在
    var selectionReadyShow = false;

    function inputStatusReady(node){
        if (node && km.isSingleSelect() && node.isSelected()) {


            var color = node.getStyle('text-selection-color');

            //准备输入状态

            receiver.updateByMinderNode(node);

            sel.setHide()
                .setStartOffset(0)
                .setEndOffset(receiver.getTxtOfContainer().length)
                .setColor(color);


            receiver.updateContainerRangeBySel();

            if(browser.ie ){
                var timer = setInterval(function(){
                    var nativeRange = range.nativeSel.getRangeAt(0);
                    if(!nativeRange || nativeRange.collapsed){
                        range.select();
                    }else {
                        clearInterval(timer);
                    }
                });
            }


            km.setStatus('inputready');

        }

    }

    km.textEditNode = function(node){
        inputStatusReady(node);
        km.setStatus('textedit');
        receiver.updateSelection();
    };
    return {
        'events': {
            'ready': function() {
                document.body.appendChild(receiver.container);
            },

            'normal.beforemousedown textedit.beforemousedown inputready.beforemousedown': function(e) {
                //右键直接退出
                if (e.isRightMB()) {
                    return;
                }


                mouseDownStatus = true;

                selectionReadyShow = sel.isShow();

                sel.setHide();

                var node = e.getTargetNode();

                //点击在之前的选区上
                if (!node) {
                    var selectionShape = e.kityEvent.targetShape;
                    if (selectionShape && selectionShape.getType() == 'Selection') {
                        node = receiver.getMinderNode();
                        e.stopPropagationImmediately();
                    }

                }

                if(node){

                    if (this.isSingleSelect() && node.isSelected()) {
                        var textGroup = node.getTextGroup();

                        textGroup.setStyle('cursor', 'default');
                        sel.collapse(true);
                        sel.setColor(node.getStyle('text-selection-color'));

                        receiver
                            .updateByMinderNode(node)
                            .updateIndexByMouse(e.getPosition(node.getRenderContainer()))
                            .setRange(range)
                            .setReady();


                        if(selectionReadyShow){

                            textGroup.setStyle('cursor', 'text');
                            sel.setShowStatus();
                            setTimeout(function() {
                                sel.collapse(true)
                                    .updatePosition(receiver.getOffsetByIndex())
                                    .setShow();
                            }, 200);
                            km.setStatus('textedit');

                        }

                        return;

                    }
                }
                //模拟光标没有准备好
                receiver.clearReady();
                //当点击空白处时，光标需要消失
                receiver.clear();

            },
            'inputready.keyup':function(e){
                if(sel.isHide()){
                    inputStatusReady(this.getSelectedNode());
                }
            },

            //当节点选区通过键盘发生变化时，输入状态要准备好
            'normal.keyup': function(e) {
                var node = this.getSelectedNode();
                if (node) {
                    if (this.isSingleSelect() && node.isSelected() && !sel.isShow() ) {
                        var orgEvt = e.originEvent,
                            keyCode = orgEvt.keyCode;
                        if (keymap.isSelectedNodeKey[keyCode] &&
                            !orgEvt.ctrlKey &&
                            !orgEvt.metaKey &&
                            !orgEvt.shiftKey &&
                            !orgEvt.altKey) {
                                inputStatusReady(node);
                        }
                    }
                }
            },
            'normal.mouseup textedit.mouseup inputready.mouseup': function(e) {

                mouseDownStatus = false;

                var node = e.getTargetNode();


                if (node && !selectionReadyShow && receiver.isReady()) {

                    sel.collapse(true);

                    sel.setColor(node.getStyle('text-selection-color'));



//                    node.getTextShape().setStyle('cursor', 'text');


                    //必须再次focus，要不不能呼出键盘
                    if(browser.ipad){
                        receiver.focus();
                    }

                    setTimeout(function() {
                        sel.collapse(true)
                            .updatePosition(receiver.getOffsetByIndex())
                            .setShow();
                    }, 200);


                    km.setStatus('textedit');

                    return;
                }
                //当选中节点后，输入状态准备
                if(sel.isHide()){
                    inputStatusReady(e.getTargetNode());
                }else {
                    //当有光标时，要同步选区
                    if(!sel.collapsed){
                        receiver.updateContainerRangeBySel();
                    }


                }




            },
            'textedit.beforemousemove inputready.beforemousemove': function(e) {

                if(browser.ipad){
                    return;
                }
                //ipad下不做框选
                if (mouseDownStatus && receiver.isReady() && selectionReadyShow) {
                    var node = e.getTargetNode();
                    e.stopPropagationImmediately();

                    if(node){
                        var offset = e.getPosition(node.getRenderContainer());

                        receiver.updateSelectionByMousePosition(offset)
                            .updateSelection(offset)
                            .updateContainerRangeBySel();

                    }


                }else if(mouseDownStatus && !selectionReadyShow){
                    //第一次点中，第二次再次点中进行拖拽
                    km.setStatus('normal');
                    receiver.clearReady();
                }
            },
            'normal.dblclick textedit.dblclick inputready.dblclick': function(e) {

                var node = e.getTargetNode();

                if(node){
                    inputStatusReady(node);

                    km.setStatus('textedit');

                    receiver.updateSelection();
                }

            },
            'restoreScene': function() {
                receiver.clear();
                inputStatusReady(this.getSelectedNode());
            },
            'stopTextEdit': function() {
                receiver.clear();
                km.setStatus('normal');
            },
            'resize': function(e) {
                sel.setHide();
            },
            'execCommand': function(e) {
                var cmds = {
                    'appendchildnode': 1,
                    'appendsiblingnode': 1,
                    'editnode': 1
                };
                if (cmds[e.commandName]) {
                    inputStatusReady(km.getSelectedNode());
                    receiver.updateSelection();
                    return;

                }

                if(sel.isShow()){
                    receiver.updateTextOffsetData().updateSelection();
                }
            },
            'layoutfinish':function(e){
                if (e.node === receiver.minderNode && (this.getStatus() == 'textedit' || this.getStatus() == 'inputready') ) {//&& selectionReadyShow
                    receiver.setContainerStyle();
                }
            },
            'selectionclear': function() {
                var node = km.getSelectedNode();
                if(node){
                    inputStatusReady(node);
                }else{
                    km.setStatus('normal');
                    receiver.clear();
                }


            },
            'blur': function() {
               !/\?debug#?/.test(location.href) && receiver.clear();
            },
            'textedit.import': function() {
                km.setStatus('normal');
                receiver.clear();
            },
            'inputready.mousewheel textedit.mousewheel': function() {
                receiver.setContainerStyle();
            }

        }
    };
});