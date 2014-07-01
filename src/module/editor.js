/* global Renderer: true */

KityMinder.registerModule('TextEditModule', function() {
    var km = this;
    var sel = new Minder.Selection();
    var range = new Minder.Range();
    var receiver = new Minder.Receiver(this,sel,range);


    this.receiver = receiver;

    //鼠标被点击，并未太抬起时为真
    var mouseDownStatus = false;

    var lastEvtPosition, dir = 1;

    //当前是否有选区存在
    var selectionReadyShow = false;

    function inputStatusReady(node){
        if (node && km.isSingleSelect() && node.isSelected()) {
            //准备输入状态
            var textShape = node.getTextShape();

            sel.setHide()
                .setStartOffset(0)
                .setEndOffset(textShape.getContent().length);

            receiver
                .setMinderNode(node)
                .updateContainerRangeBySel();

            km.setStatus('inputready');

        }

    }

    km.textEditNode = function(node){
        inputStatusReady(node);
        km.setStatus('textedit');
        receiver.updateSelectionShow();
    };
    return {
        'events': {
            'ready': function() {
                this._renderTarget.appendChild(receiver.container);
            },

            'normal.beforemousedown textedit.beforemousedown inputready.beforemousedown': function(e) {
                //右键直接退出
                if (e.isRightMB()) {
                    e.stopPropagationImmediately();
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

                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor', 'default');
                    if (this.isSingleSelect() && node.isSelected()) {
                        sel.collapse();


                        receiver
                            .setMinderNode(node)
                            .setCurrentIndex(e.getPosition(this.getRenderContainer()))
                            .setRange(range)
                            .setReady();

                        lastEvtPosition = e.getPosition(this.getRenderContainer());

                        if(selectionReadyShow){
                            textShape.setStyle('cursor', 'text');
                            receiver.updateSelection();

                            km.setStatus('textedit');

                        }

                        return;

                    }
                }
                //模拟光标没有准备好
                receiver.clearReady();


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

                    sel.collapse();

                    node.getTextShape().setStyle('cursor', 'text');

                    receiver.updateSelection();


                    lastEvtPosition = e.getPosition(this.getRenderContainer());

                    km.setStatus('textedit');

                    return;
                }

                //当选中节点后，输入状态准备
                if(sel.isHide()){
                    inputStatusReady(e.getTargetNode());
                }



            },
            'textedit.beforemousemove inputready.beforemousemove': function(e) {
                if(browser.ipad){
                    return;
                }
                //ipad下不做框选
                if (mouseDownStatus && receiver.isReady() && selectionReadyShow) {


                    e.stopPropagationImmediately();

                    var offset = e.getPosition(this.getRenderContainer());
                    dir = offset.x > lastEvtPosition.x ? 1 : (offset.x < lastEvtPosition.x ? -1 : dir);
                    receiver.updateSelectionByMousePosition(offset, dir)
                        .updateSelectionShow(dir);

                    lastEvtPosition = e.getPosition(this.getRenderContainer());

                }else if(mouseDownStatus && !selectionReadyShow){
                    //第一次点中，第二次再次点中进行拖拽
                    km.setStatus('normal');
                    receiver.clearReady();
                }
            },
            'normal.dblclick textedit.dblclick inputready.dblclick': function(e) {

                var node = e.getTargetNode();
                if(node){
                    inputStatusReady(e.getTargetNode());

                    km.setStatus('textedit');

                    receiver.updateSelectionShow();
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
                    receiver.updateSelectionShow();
                    return;

                }

                receiver.clear();
                if (this.getStatus() == 'textedit') {
                    this.setStatus('normal');
                }
            },
            'layoutfinish':function(e){
                if (e.node === receiver.minderNode && (this.getStatus() == 'textedit' || this.getStatus() == 'inputready') ) {//&& selectionReadyShow
                    receiver
                        .setBaseOffset()
                        .setContainerStyle();

                }
            },
            'selectionclear': function() {
                km.setStatus('normal');
                receiver.clear();
            },
            'blur': function() {
                receiver.clear();
            },
            'import': function() {
                km.setStatus('normal');
                receiver.clear();
            },
            'textedit.mousewheel': function() {
                receiver.setContainerStyle();
            }
        }
    };
});