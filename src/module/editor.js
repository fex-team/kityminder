KityMinder.registerModule( "TextEditModule", function () {
    var km = this;
    var sel = new Minder.Selection();
    var receiver = new Minder.Receiver(this);
    var range = new Minder.Range();

    this.receiver = receiver;

    var mouseDownStatus = false;

    var oneTime = 0;

    var lastEvtPosition,dir = 1;



    km.isTextEditStatus = function(){
        return km.receiver.isTextEditStatus();
    };

    var selectionByClick = false;


    return {
        "events": {
            //插入光标
            "afterinitstyle":function(){
                this.getRenderContainer().addShape(sel);
            },
            'normal.beforemousedown textedit.beforemousedown':function(e){
                if(e.isRightMB()){
                    e.stopPropagationImmediately();
                    return;
                }
                sel.setHide();
                var node = e.getTargetNode();
                if(!node){
                    var selectionShape = e.kityEvent.targetShape;
                    if(selectionShape && selectionShape.getType() == 'Selection'){
                        selectionByClick = true;
                        node = selectionShape.getData('relatedNode');
                        e.stopPropagationImmediately();
                    }
                    if(this.getStatus() == 'textedit')
                        this.fire('contentchange');
                    km.setStatus('normal')
                }
                if(node){
                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor','default');

                    if ( this.isSingleSelect() && node.isSelected()) {// && e.kityEvent.targetShape.getType().toLowerCase()== 'text'

                        sel.collapse();
                        node.getTextShape().setStyle('cursor','text');
                        km.setStatus('textedit');
                        receiver.setTextEditStatus(true)
                            .setSelection(sel)
                            .setKityMinder(this)
                            .setMinderNode(node)
                            .setTextShape(textShape)
                            .setBaseOffset()
                            .setContainerStyle()
                            .setSelectionHeight()
                            .setCurrentIndex(e.getPosition())
                            .updateSelection()
                            .setRange(range);
                        sel.setData('relatedNode',node);
                        mouseDownStatus = true;
                        lastEvtPosition = e.getPosition();
                        if(selectionByClick){
                            sel.setShow();
                            selectionByClick = false;
                        }
                        km.setStatus('textedit')
                    }
                }
            },
            //当输入键值是内容时，进入textedit状态
            'normal.beforekeydown':function(e){
                var node = this.getSelectedNode();
                if(node){
                    if ( this.isSingleSelect() && node.isSelected()) {
                        var keyCode = e.originEvent.keyCode;
                        if(!keymap.notContentInput[keyCode] && range.nativeSel.rangeCount != 0){
                            var nativeRange = range.nativeSel.getRangeAt(0);
                            if(nativeRange && (nativeRange.startContainer === receiver.container || receiver.container.contains(nativeRange.startContainer )))
                                km.setStatus('textedit')
                        }
                    }
                }
            },
            //当节点选区通过键盘发生变化时，输入状态要准备好
            'normal.keyup':function(e){
                var node = this.getSelectedNode();
                if(node){
                    if ( this.isSingleSelect() && node.isSelected()) {
                        var keyCode = e.originEvent.keyCode;
                        if(keymap.isSelectedNodeKey[keyCode] && km.getStatus() != 'textedit'){
                           //准备输入状态
                            var textShape = node.getTextShape();

                            sel.setHide();
                            sel.setStartOffset(0);
                            sel.setEndOffset(textShape.getContent().length);

                            receiver.setTextEditStatus(true)
                                .setSelection(sel)
                                .setKityMinder(this)
                                .setMinderNode(node)
                                .setTextShape(textShape)
                                .setRange(range)
                                .setBaseOffset()
                                .setContainerStyle()
                                .setSelectionHeight()
                                .setContainerTxt(textShape.getContent())
                                .updateRange(range).setTextEditStatus(true);

                            sel.setData('relatedNode',node);
                        }
                    }
                }
            },
            'normal.mouseup textedit.mouseup':function(e){

                if(mouseDownStatus){
                    if(!sel.collapsed ){
                        try{
                            receiver.updateRange(range)
                        }catch(e){
                            console.log(e)
                        }

                    }else
                       sel.setShow()
                }else{
                    //当选中节点后，输入状态准备
                    var node = e.getTargetNode();
                    if(node){
                        if ( this.isSingleSelect() && node.isSelected()) {
                            //准备输入状态
                            var textShape = node.getTextShape();

                            sel.setHide();
                            sel.setStartOffset(0);
                            sel.setEndOffset(textShape.getContent().length);

                            receiver.setTextEditStatus(true)
                                .setSelection(sel)
                                .setKityMinder(this)
                                .setMinderNode(node)
                                .setTextShape(textShape)
                                .setRange(range)
                                .setBaseOffset()
                                .setContainerStyle()
                                .setSelectionHeight()
                                .setContainerTxt(textShape.getContent())
                                .updateRange(range).setTextEditStatus(true);

                            sel.setData('relatedNode',node);

                        }
                    }
                }


                mouseDownStatus = false;
                oneTime = 0;
            },
            'textedit.beforemousemove':function(e){
                if(mouseDownStatus){
                    e.stopPropagationImmediately();

                    var offset = e.getPosition();

                    if(Math.abs(offset.y - lastEvtPosition.y) >= 1 && Math.abs(lastEvtPosition.x - offset.x) <= 1 ){

                        sel.setHide();
                        mouseDownStatus = false;
                        return;
                    }
                    dir = offset.x > lastEvtPosition.x  ? 1 : (offset.x  < lastEvtPosition.x ? -1 : dir);
                    receiver.updateSelectionByMousePosition(offset,dir)
                        .updateSelectionShow(dir);

                    lastEvtPosition = e.getPosition();

                }
            },
            'normal.dblclick textedit.dblclick':function(e){

                var text =  e.kityEvent.targetShape;
                if ( text.getType().toLowerCase()== 'text') {

                    sel.setStartOffset(0);
                    sel.setEndOffset(text.getContent().length);
                    sel.setShow();
                    receiver.setContainerTxt(text.getContent()).updateSelectionShow(1)
                        .updateRange(range).setTextEditStatus(true);
                    km.setStatus('textedit');
                }
            },
            'restoreScene':function(){
                sel.setHide();
            },
            'stopTextEdit':function(){
                sel.setHide();
                receiver.clear().setTextEditStatus(false);
                km.setStatus('normal');
            },
            "resize": function ( e ) {
                sel.setHide();
            },
            "execCommand": function( e ) {
//                var cmds = {
//                    'appendchildnode' : 1,
//                    'appendsiblingnode' : 1,
//                    'editnode' : 1
//                };
//                if ( cmds[ e.commandName ] ){
//
//                    var node = km.getSelectedNode();
//                    if( !node ){
//                        return;
//                    }
//
//                    var textShape = node.getTextShape();
//
//                    textShape.setStyle('cursor','default');
//                    node.getTextShape().setStyle('cursor','text');
//                    km.setStatus('textedit');
//                    receiver.setTextEditStatus(true)
//                        .setSelection(sel)
//                        .setKityMinder(this)
//                        .setMinderNode(node)
//                        .setTextShape(textShape)
//                        .setBaseOffset()
//                        .setContainerStyle()
//                        .setSelectionHeight()
//                        .getTextOffsetData()
//                        .setIndex(0)
//                        .updateSelection()
//                        .setRange(range);
//
//                    sel.setStartOffset(0);
//                    sel.setEndOffset(textShape.getContent().length);
//                    sel.setShow();
//
//                    receiver.updateSelectionShow(1)
//                        .updateRange(range);
//                    return;
//
//                }

                if((e.commandName == 'priority' || e.commandName == 'progress') && this.getStatus() == 'textedit' ){

                    receiver.setBaseOffset()
                        .getTextOffsetData();

                    if(sel.collapsed){
                        receiver.updateSelection();
                    }else{
                        receiver.updateSelectionShow(1)
                    }
                    return;


                }
                receiver.clear().setTextEditStatus(false);
                if(this.getStatus() == 'textedit'){
                    this.setStatus('normal')
                }
            },
            'selectionclear':function(){
                km.setStatus('normal');
                receiver.setTextEditStatus(false).clear()
            },
            blur:function(){
                receiver.clear()
            },
            'textedit.mousewheel':function(){
                receiver.setContainerStyle()
            }
        }
    };
} );