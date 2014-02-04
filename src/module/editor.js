KityMinder.registerModule( "TextEditModule", function () {
    var cursor = new Minder.Cursor();
    var receiver = new Minder.Receiver(this);
    var range = new Minder.Range();


    return {
        //插入光标
        "init":function(){
            this.getPaper().addShape(cursor);
        },
        "events": {
            'beforemousedown':function(e){
                if(this.isSingleSelect()){

                    var node = this.getSelectedNode();
                    var textShape = node.getTextShape();

//                    node.getRenderContainer().setStyle('cursor','text');
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
        }
    };
} );