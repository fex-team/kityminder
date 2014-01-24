KityMinder.registerModule( "TextEditModule", function () {
    var cursor = new Minder.Cursor();
    var receiver = new Minder.Receiver();
    var range = new Minder.Range();


    return {
        //插入光标
        "init":function(){
            this.getPaper().addShape(cursor);
        },
        "events": {
            'beforemousedown':function(e){
//
//                if(this.isSingleSelect()){
//                    console.log('isSelect')
//                    var node = this.getSelectedNode();
//                    var node_rc = node.getRenderContainer();
//                    var position = e.getPosition();
//                    if(node_rc.getType() != 'Text'){
//                    var offset = e.getPosition();
//                    cursor.setShow().setPosition(offset);
////                    receiver.clear()
////                        .setTextShape()
////                        .setTextShapeSize(cursor.height)
////                        .appendTextShapeToPaper(this.getPaper())
////                        .setPosition(position)
////                        .setRange(range,0)
////                        .setCursor(cursor)
//                        receiver.setCursor(cursor)
//                            .setKityMinder(this)
//                            .setMinderNode(node)
//                            .setTextShape(node_rc)
//                            .setCursorHeight()
//                            .setCurrentIndex(position)
//                            .updateCursor()
//                            .setRange(range,0);
//                    }else{
//
//
////                        receiver.setCursor(cursor)
////                            .setKityMinder(this)
////                            .setMinderNode(e.getTargetNode())
////                            .setTextShape(node_rc)
////                            .setCursorHeight()
////                            .setCurrentIndex(position)
////                            .updateCursor()
////                            .setRange(range);
//
//                    }
//                }

            }
        }
    };
} );