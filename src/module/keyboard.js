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

    function quadOf( p ) {
        return p.x > 0 ?
            ( p.y > 0 ? 1 : 2 ) :
            ( p.y < 0 ? 3 : 4 );
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var matrix = new kity.Matrix().translate( -find.x, -find.y ).rotate( 45 );
        var most = {}, quad;
        var current;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = matrix.transformPoint( pointIndexes[ i ].x, pointIndexes[ i ].y );
            quad = quadOf( current );
            if ( !most[ quad ] || current.length() < most[ quad ].point.length() ) {
                most[ quad ] = {
                    point: current,
                    node: pointIndexes[ i ].node
                };
            }
        }
        find.node._nearestNodes = {
            right: most[ 1 ] && most[ 1 ].node || null,
            top: most[ 2 ] && most[ 2 ].node || null,
            left: most[ 3 ] && most[ 3 ].node || null,
            down: most[ 4 ] && most[ 4 ].node || null
        };
    }

    function findMinDepthNode( nodes ) {
        var depth,
            minDepth = Number.MAX_VALUE,
            minDepthNode = null;
        for ( var i = 0; i < nodes.length; i++ ) {
            depth = nodes[ i ].getDepth();
            if ( depth < minDepth ) {
                minDepth = depth;
                minDepthNode = nodes[ i ];
            }
        }
        return minDepthNode;
    }

    var KBCreateAndEditCommand = kity.createClass( {
        base: Command,
        execute: function ( km, type, referNode ) {
            var node = this.createdNode = km.execCommand( 'create' + type + 'node', referNode );
            km.selectSingle( node );
            km.execCommand( 'editText', node );
            this.setContentChanged( true );
        },

        revert: function ( km ) {
            km.execCommand( 'removeNode', this.createdNode );
        }
    } );

    var KBNavigateCommand = kity.createClass( {
        base: Command,
        execute: function ( km, direction, referNode ) {
            var nextNode = referNode._nearestNodes[ direction ];
            if ( nextNode ) {
                km.toggleSelect( [ referNode, nextNode ] );
                km.execCommand( 'rendernode', [ referNode, nextNode ] );
            }
            this.setContentChanged( false );
        }
    } );

    var KBRemoveCommand = kity.createClass( {
        base: Command,
        execute: function ( km, nodes ) {
            if ( !nodes.length ) {
                return;
            }
            km.clearSelect( nodes );
            var select = this.getNextSelection( km, nodes );
            km.execCommand( 'removeNode', nodes );
            km.select( select );
            km.execCommand( 'rendernode', select );
        },
        getNextSelection: function ( km, removeNodes ) {
            var minDepthNode = findMinDepthNode( removeNodes );
            var parent = minDepthNode.getParent();
            if ( !parent ) {
                return km.getRoot();
            }
            var length = parent.getChildren().length;
            if ( length > 1 ) {
                var index = minDepthNode.getIndex() + 1;
                return parent.getChild( index % length );
            } else {
                return parent;
            }
        }
    } );

    return {
        // private usage
        "commands": {
            'kbCreateAndEdit': KBCreateAndEditCommand,
            'kbNavigate': KBNavigateCommand,
            'kbRemove': KBRemoveCommand
        },
        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            keydown: function ( e ) {
                var sNodes = this.getSelectedNodes(),
                    isSingleSelected = sNodes.length === 1,
                    isRootSelected = this.isNodeSelected( this.getRoot() );


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
                    var rootIndex = sNodes.indexOf( this.getRoot() );
                    if ( rootIndex != -1 ) {
                        sNodes.splice( rootIndex, 1 );
                    }
                    this.execCommand( 'kbRemove', sNodes );
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
                        }[ e.originEvent.keyCode ], sNodes[ 0 ] );
                    }
                    break;
                }
            }
        }
    };
} );