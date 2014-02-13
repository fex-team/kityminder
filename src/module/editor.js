KityMinder.registerModule( "TextEditModule", function () {
    var cursor = new Minder.Cursor();
    var receiver = new Minder.Receiver(this);
    var range = new Minder.Range();

    this.receiver = receiver;
    return {
        //插入光标
        "init":function(){
            this.getPaper().addShape(cursor);
        },
        "events": {
            'beforemousedown':function(e){
                cursor.setHide();
                var node = e.getTargetNode();
                if(node){
                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor','default');
                    if(node.isSelected()){
                        node.getTextShape().setStyle('cursor','text');
                        receiver.setTextEditStatus(true)
                            .setCursor(cursor)
                            .setKityMinder(this)
                            .setMinderNode(node)
                            .setTextShape(textShape)
                            .setBaseOffset()
                            .setContainerStyle()
                            .setCursorHeight()
                            .setCurrentIndex(e.getPosition())
                            .updateCursor()
                            .setRange(range);
                    }
                }
            },
            'restoreScene':function(){
                cursor.setHide();
            },
            'stopTextEdit':function(){
                cursor.setHide();

            }
        }
    };
} );