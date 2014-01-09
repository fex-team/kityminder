KityMinder.registerModule( "TextEditModule", function () {
    var cursor = new Minder.Cursor();
    var receiver = new Minder.Receiver();
    var range = new Minder.Range();

    this.getPaper().addShape(cursor);
    return {
        "events": {
            'mousedown':function(e){

                var originEvent = e.originEvent;
                var targetShape = e.kityEvent.targetShape;
                var position = e.getPosition();
                if(targetShape.getType() != 'Text'){
//                    var offset = e.getPosition();
//                    cursor.setShow().setPosition(offset);
//                    receiver.clear()
//                        .setTextShape()
//                        .setTextShapeSize(cursor.height)
//                        .appendTextShapeToPaper(this.getPaper())
//                        .setPosition(position)
//                        .setRange(range,0)
//                        .setCursor(cursor)
                }else{


                    receiver.setCursor(cursor)
                        .setKityMinder(this)
                        .setMinderNode(e.getTargetNode())
                        .setTextShape(targetShape)
                        .setCursorHeight()
                        .setCurrentIndex(position)
                        .updateCursor()
                        .setRange(range);

                }
            },
            'kbcreateandedit':function(){
                receiver.clear()

            }
        }
    };
} );