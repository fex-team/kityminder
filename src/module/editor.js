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
    }

    return {
        //插入光标
        "init":function(){
            this.getPaper().addShape(sel);
        },
        "events": {
            'beforemousedown':function(e){
                sel.setHide();
                var node = e.getTargetNode();
                if(node){
                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor','default');

                    if ( this.isSingleSelect() && node.isSelected()) {// && e.kityEvent.targetShape.getType().toLowerCase()== 'text'

                        sel.collapse();
                        node.getTextShape().setStyle('cursor','text');
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
                        mouseDownStatus = true;
                        lastEvtPosition = e.getPosition();
                    }
                }
            },
            'mouseup':function(e){
                if(!sel.collapsed && mouseDownStatus){
                    receiver.updateRange(range)
                }
                mouseDownStatus = false;
                oneTime = 0;
            },
            'beforemousemove':function(e){
                if(mouseDownStatus){
                    e.stopPropagationImmediately();

                    var offset = e.getPosition();

                    if(Math.abs(offset.y - lastEvtPosition.y) > 2){
                        sel.setHide();
                        mouseDownStatus = false;
                        return;
                    }
                    dir = offset.x > lastEvtPosition.x  ? 1 : (offset.x  < lastEvtPosition.x ? -1 : dir);
                    receiver.updateSelectionByMousePosition(offset,dir)
                        .updateSelectionShow(dir);
                    sel.stroke('none',0);
                    lastEvtPosition = e.getPosition();

                }
            },
            'dblclick':function(e){

                var text =  e.kityEvent.targetShape;
                if ( text.getType().toLowerCase()== 'text') {

                    sel.setStartOffset(0);
                    sel.setEndOffset(text.getContent().length);
                    sel.setShow();
                    receiver.setContainerTxt(text.getContent()).updateSelectionShow(1)
                        .updateRange(range).setTextEditStatus(true)

                }
            },
            'restoreScene':function(){
                sel.setHide();
            },
            'stopTextEdit':function(){
                sel.setHide();
                receiver.clear().setTextEditStatus(false);
            },
            'execCommand':function(e){
                var cmds = {
                    'appendchildnode':1,
                    'appendsiblingnode':1
                };
                if(cmds[e.commandName]){

                    var node = km.getSelectedNode();

                    var textShape = node.getTextShape();

                    textShape.setStyle('cursor','default');
                    node.getTextShape().setStyle('cursor','text');
                    receiver.setTextEditStatus(true)
                        .setSelection(sel)
                        .setKityMinder(this)
                        .setMinderNode(node)
                        .setTextShape(textShape)
                        .setBaseOffset()
                        .setContainerStyle()
                        .setSelectionHeight()
                        .getTextOffsetData()
                        .setIndex(0)
                        .updateSelection()
                        .setRange(range);

                    sel.setStartOffset(0);
                    sel.setEndOffset(textShape.getContent().length);
                    sel.setShow();

                    receiver.updateSelectionShow(1)
                        .updateRange(range);
                    return;

                }

                if(e.commandName == 'priority' || e.commandName == 'progress'){
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
            },
            'selectionclear':function(){
                receiver.setTextEditStatus(false).clear()
            }
        }
    };
} );