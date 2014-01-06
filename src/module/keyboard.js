KityMinder.registerModule( "KeyboardModule", function () {

    function buildPositionNetwork( root ) {
        var pointIndexes = [],
            x, y;
        root.traverse( function ( node ) {
            pointIndexes.push( {
                x: node.getData( 'x' ),
                y: node.getData( 'y' ),
                node: node
            } );
        } );
        for ( var i = 0; i < pointIndexes.length; i++ ) {
            findClosestPointsFor( pointIndexes, i );
        }
    }

    function calcQuad( p ) {
        return p.x > 0 ?
            ( p.y > 0 ? 1 : 2 ) :
            ( p.y < 0 ? 3 : 4 );
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var matrix = new kity.Matrix().translate( -find.x, -find.y ).rotate( -45 );
        var most = {}, quad;
        var current;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = matrix.transformPoint( pointIndexes[ i ].x, pointIndexes[ i ].y );
            quad = calcQuad( current );
            if ( !most[ quad ] || current.length() < most[ quad ].point.length ) {
                most[ quad ] = {
                    point: current,
                    node: pointIndexes[ i ].node
                };
            }
        }
        find.node.setData( 'nearestNodes', {
            right: most[ 1 ] || null,
            top: most[ 2 ] || null,
            left: most[ 3 ] || null,
            down: most[ 4 ] || null
        } );
    }

    var KBCreateAndEditCommand = kity.createClass( {
        base: Command,
        execute: function ( km, type, referNode ) {
            console.log( "refer:", referNode );
            var node = km.execCommand( 'create' + type + 'node', referNode );
            km.execCommand( 'edittext', node );
            this.setContentChanged( true );
        }
    } );

    var KBNavigateCommand = kity.createClass( {
        base: Command,
        execute: function ( km, direction, referNode ) {
            var nextNode = referNode.getData( 'nearestNodes' )[ direction ];
            if ( nextNode ) {
                km.toggleSelect( [ referNode, nextNode ] );
                this.execCommand( 'rendernode', [ referNode, nextNode ] );
            }
        }
    } );

    return {
        // private usage
        "commands": {
            'kbCreateAndEdit': KBCreateAndEditCommand,
            'kbNavigate': KBNavigateCommand
        },
        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            keydown: function ( e ) {
                var sNodes = this.getSelectedNodes(),
                    isSingleSelected = sNodes.length === 1,
                    isRootSelected = this.isNodeSelected( this.getRoot() );
                console.log( e.originEvent.keyCode );
                e.originEvent.preventDefault();
                switch ( e.originEvent.keyCode ) {

                case 13:
                    // Enter
                    if ( isSingleSelected ) {
                        if ( isRootSelected ) {
                            this.execCommand( 'kbCreateAndEdit', 'child', sNodes[ 0 ] );
                        } else {
                            this.execCommand( 'kbCreateAndEdit', 'sibling', sNodes[ 0 ] );
                        }
                    }
                    break;

                case 9:
                    // Tab
                    if ( isSingleSelected ) {
                        this.execCommand( 'kbCreateAndEdit', 'child', sNodes[ 0 ] );
                    }
                    break;
                case 8:
                case 46:
                    // Backspace or Delete
                    this.execCommand( 'removeNode', sNodes );
                    break;

                case 37:
                case 38:
                case 39:
                case 40:
                    if ( isSingleSelected ) {
                        this.execCommand( 'kbNavigate', {
                            37: 'left',
                            38: 'top',
                            39: 'right',
                            40: 'down'
                        }[ e.keyCode ], sNodes[ 0 ] );
                    }
                    break;
                }
            }
        }
    };
} );