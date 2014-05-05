KityMinder.registerModule( "NodeText", function () {
    return {
        events: {
            'renderNodeCenter': function ( e ) {
                var node = e.node;
                var width = node.getContRc().getWidth();
                var textShape = new kity.Text( node.getData( 'text' ) || '' );
                textShape.setAttr( '_nodeTextShape', true );
                node.getContRc().appendShape( textShape );
                var style = this.getCurrentLayoutStyle()[ node.getType() ];
                textShape.fill( style.color ).setSize( style.fontSize );
                textShape.setTranslate( width + style.spaceLeft, 0 );
                textShape.setVerticalAlign( 'middle' );
            }
        }
    }
} );