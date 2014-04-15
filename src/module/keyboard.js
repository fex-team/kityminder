KityMinder.registerModule( "KeyboardModule", function () {
    var min = Math.min,
        max = Math.max,
        abs = Math.abs,
        sqrt = Math.sqrt,
        exp = Math.exp;

    function buildPositionNetwork( root ) {
        var pointIndexes = [],
            p;
        root.traverse( function ( node ) {
            p = node.getRenderContainer().getRenderBox( 'top' );
            pointIndexes.push( {
                left: p.x,
                top: p.y,
                right: p.x + p.width,
                bottom: p.y + p.height,
                width: p.width,
                height: p.height,
                node: node,
                text: node.getText()
            } );
        } );
        for ( var i = 0; i < pointIndexes.length; i++ ) {
            findClosestPointsFor( pointIndexes, i );
        }
    }


    // 这是金泉的点子，赞！
    // 求两个不相交矩形的最近距离
    function getCoefedDistance( box1, box2 ) {
        var xMin, xMax, yMin, yMax, xDist, yDist, dist, cx, cy;
        xMin = min( box1.left, box2.left );
        xMax = max( box1.right, box2.right );
        yMin = min( box1.top, box2.top );
        yMax = max( box1.bottom, box2.bottom );

        xDist = xMax - xMin - box1.width - box2.width;
        yDist = yMax - yMin - box1.height - box2.height;

        if ( xDist < 0 ) dist = yDist;
        else if ( yDist < 0 ) dist = xDist;
        else dist = sqrt( xDist * xDist + yDist * yDist );

        return {
            cx: dist,
            cy: dist
        };
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var most = {}, quad;
        var current, dist;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = pointIndexes[ i ];
            dist = getCoefedDistance( current, find );

            // left check
            if ( current.right < find.left ) {
                if ( !most.left || dist.cx < most.left.dist ) {
                    most.left = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // right check
            if ( current.left > find.right ) {
                if ( !most.right || dist.cx < most.right.dist ) {
                    most.right = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // top check
            if ( current.bottom < find.top ) {
                if ( !most.top || dist.cy < most.top.dist ) {
                    most.top = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }

            // bottom check
            if ( current.top > find.bottom ) {
                if ( !most.down || dist.cy < most.down.dist ) {
                    most.down = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }
        }
        find.node._nearestNodes = {
            right: most.right && most.right.node || null,
            top: most.top && most.top.node || null,
            left: most.left && most.left.node || null,
            down: most.down && most.down.node || null
        };
    }


    function navigateTo( km, direction ) {
        var referNode = km.getSelectedNode();
        if ( !referNode ) {
            km.select( km.getRoot() );
            buildPositionNetwork( km.getRoot() );
            return;
        }
        var nextNode = referNode._nearestNodes[ direction ];
        if ( nextNode ) {
            km.select( nextNode, true );
        }
    }
    return {

        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            "normal.keydown": function ( e ) {

                var keys = KityMinder.keymap;

                var node = e.getTargetNode();
                this.receiver.keydownNode = node;
                switch ( e.originEvent.keyCode ) {
                case keys.Enter:
                    this.execCommand( 'appendSiblingNode', new MinderNode( this.getLang().topic ), true );
                    e.preventDefault();
                    break;
                case keys.Tab:
                    this.execCommand( 'appendChildNode', new MinderNode( this.getLang().topic ), true );
                    e.preventDefault();
                    break;
                case keys.Backspace:
                case keys.Del:
                    e.preventDefault();
                    if ( this.queryCommandState( 'removenode' ) !== -1 ) this.execCommand( 'removenode' );
                    break;

                case keys.Left:
                    navigateTo( this, 'left' );
                    e.preventDefault();
                    break;
                case keys.Up:
                    navigateTo( this, 'top' );
                    e.preventDefault();
                    break;
                case keys.Right:
                    navigateTo( this, 'right' );
                    e.preventDefault();
                    break;
                case keys.Down:
                    navigateTo( this, 'down' );
                    e.preventDefault();
                    break;
                }

            }
        }
    };
} );