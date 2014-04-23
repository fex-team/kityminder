KityMinder.registerModule( "NodeText", function () {
    var km = this;
    return {
        events:{
            'renderNodeCenter':function(e){

                var node = e.node;
                if(node.getType() == 'root')
                    debugger
                var width = node.getContRc().getWidth();
                var textShape = new kity.Text( node.getData( 'text' ) || '' );
                textShape.setAttr( '_nodeTextShape', true );
                node.getContRc().appendShape( textShape );
                var style = this.getCurrentLayoutStyle()[node.getType()];
                textShape.fill(style.color).setSize(style.fontSize);
                textShape.setPosition(width,textShape.getHeight()*.75)
            }
        }
    }
} );