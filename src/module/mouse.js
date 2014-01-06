KityMinder.registerModule( "MouseModule", function () {
    var SingleSelectCommand = kity.createClass( 'SingleSelectCommand', {
        base: Command,
        execute: function ( km, node ) {
            var deltaNodes = km.getSelectedNodes();
            km.clearSelect();
            if ( node ) {
                km.selectSingle( node );
                deltaNodes.push( node );
            }
            km.execCommand( 'rendernode', deltaNodes );
            this.setContentChanged( false );
        }
    } );
    return {
        "commands": {
            'selectsingle': SingleSelectCommand
        },
        "events": {
            mousedown: function ( e ) {
                var clickNode = e.getTargetNode();
                this.execCommand( 'selectsingle', clickNode );
            }
        }
    };
} );