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


    function KBNavigate( km, direction ) {
        var nextNode = km.getSelectedNode()._nearestNodes[ direction ];
        if ( nextNode ) {
            km.select( nextNode );
        }
    }
    return {

        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            keydown: function ( e ) {

                switch ( e.originEvent.keyCode ) {

                case 13:
                    // Enter
                    this.execCommand( 'appendSiblingNode', new MinderNode( 'Topic' ) );
                    e.preventDefault();
                    break;
                case 9:
                    // Tab
                    this.execCommand( 'appendChildNode', new MinderNode( 'Topic' ) );
                    e.preventDefault();
                    break;
                case 8:
                case 46:
                    this.execCommand( 'removenode' );
                    e.preventDefault();
                    break;
                case 37:
                case 38:
                case 39:
                case 40:
                    if ( this.isSingleSelect() ) {
                        KBNavigate( this, {
                            37: 'left',
                            38: 'top',
                            39: 'right',
                            40: 'down'
                        }[ e.originEvent.keyCode ] );
                    }
                    e.preventDefault();
                    break;


                }

            }
        }
    }
} );