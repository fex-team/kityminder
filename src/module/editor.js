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

    var dblclickEvent = false;
    //当前是否有选区存在
    var selectionReadyShow = false;

    var mousedownNode,mouseupTimer,mousedownTimer;

    var lastMinderNode;
    function inputStatusReady(node){
        if (node && km.isSingleSelect() && node.isSelected()) {

            node.getTextGroup().setStyle('cursor','default');

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
                    if (!e.getTargetNode()) this.setStatus('normal');
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
                        lastMinderNode = node;

                        mousedownNode = node;

                        var textGroup = node.getTextGroup();


                        sel.collapse(true);
                        sel.setColor(node.getStyle('text-selection-color'));

                        receiver
                            .updateByMinderNode(node)
                            .updateIndexByMouse(e.getPosition(node.getRenderContainer()))
                            .setRange(range)
                            .setReady();

                        if(selectionReadyShow){


                            sel.setShowStatus();
                            clearTimeout(mousedownTimer);

                            mousedownTimer = setTimeout(function() {
                                if(dblclickEvent){
                                    dblclickEvent = false;
                                    return;
                                }

                                sel.collapse(true)
                                    .updatePosition(receiver.getOffsetByIndex())
                                    .setShow();
                                textGroup.setStyle('cursor','text');

                            },200);
                            km.setStatus('textedit');

                        }

                        return;

                    }
                }
                //模拟光标没有准备好
                receiver.clearReady();
                //当点击空白处时，光标需要消失
                receiver.clear();


                if(lastMinderNode){

                    lastMinderNode.getTextGroup().setStyle('cursor','default');
                }

            },
            'inputready.keyup':function(){
                if(sel.isHide()){
                    inputStatusReady(this.getSelectedNode());
                }
            },

            //当节点选区通过键盘发生变化时，输入状态要准备好
            'normal.keyup': function(e) {
                var node = this.getSelectedNode();
                var keyCode = e.getKeyCode();
                if (node) {
                    if (this.isSingleSelect() && node.isSelected() && !sel.isShow() ) {
                        var orgEvt = e.originEvent;
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

                mousedownNode = null;

                if (node && !selectionReadyShow && receiver.isReady()) {

                    sel.collapse(true);

                    sel.setColor(node.getStyle('text-selection-color'));

                    //必须再次focus，要不不能呼出键盘
                    if(browser.ipad){
                        receiver.focus();
                    }
                    clearTimeout(mouseupTimer);
                    mouseupTimer = setTimeout(function() {
                        if(dblclickEvent){
                            dblclickEvent = false;
                            return;
                        }
                        sel.collapse(true)
                            .updatePosition(receiver.getOffsetByIndex())
                            .setShow();
                        node.getTextGroup().setStyle('cursor','text');
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


                    e.stopPropagationImmediately();

                    if(mousedownNode){

                        var offset = e.getPosition( mousedownNode.getRenderContainer());

                        receiver
                            .updateSelectionByMousePosition(offset)
                            .updateSelection(offset);
                        setTimeout(function(){
                            receiver.updateContainerRangeBySel();
                        });


                    }


                }else if(mouseDownStatus && !selectionReadyShow){
                    //第一次点中，第二次再次点中进行拖拽
                    km.setStatus('normal');
                    receiver.clearReady();
                }
            },
            'normal.dblclick textedit.dblclick inputready.dblclick': function(e) {

                var node = e.getTargetNode();
                dblclickEvent = true;
                if(node){
                    //跟mouseup的timeout有冲突，这里做标记处理


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
            },
            'statuschange':function(e){
                if(e.lastStatus == 'textedit'){

                    this.fire('contentchange');
                }
            }

        }
    };
});