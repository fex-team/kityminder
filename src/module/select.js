KityMinder.registerModule( "Select", function () {
    var minder = this;
    var g = KityMinder.Geometry;

    // 框选控制
    var marqueeActivator = ( function () {
        var startPosition = null;
        var marqueeShape = new kity.Path().fill( 'rgba(255,255,255,.3)' ).stroke( 'white' );
        var marqueeMode = false;

        return {
            selectStart: function ( e ) {
                // 只接受左键
                if ( e.originEvent.button ) return;

                // 清理不正确状态
                if ( startPosition ) {
                    return this.selectEnd();
                }
                startPosition = g.snapToSharp( e.getPosition() );
                minder.getPaper().addShape( marqueeShape );
                marqueeShape.setOpacity( 0.8 ).getDrawer().clear();
            },
            selectMove: function ( e ) {
                if ( !startPosition ) return;
                var p1 = startPosition,
                    p2 = e.getPosition();

                if ( !marqueeMode ) {
                    if ( g.getDistance( p1, p2 ) < 10 ) {
                        return;
                    }
                    marqueeMode = true;
                }

                var marquee = g.getBox( p1, p2 ),
                    selectedNodes = [];

                // 使其犀利
                g.snapToSharp( marquee );

                // 选区形状更新
                marqueeShape.getDrawer().pipe( function () {
                    this.clear();
                    this.moveTo( marquee.left, marquee.top );
                    this.lineTo( marquee.right, marquee.top );
                    this.lineTo( marquee.right, marquee.bottom );
                    this.lineTo( marquee.left, marquee.bottom );
                    this.close();
                } );

                // 选中节点数据更新
                minder.getRoot().traverse( function ( node ) {
                    var renderBox = node.getRenderContainer().getRenderBox();
                    if ( g.isBoxIntersect( renderBox, marquee ) ) {
                        selectedNodes.push( node );
                    }
                } );

                minder.select( selectedNodes, true );
            },
            selectEnd: function ( e ) {
                if ( startPosition ) {
                    startPosition = null;
                }
                if ( marqueeMode ) {
                    marqueeShape.fadeOut( 200, 'ease', 0, function () {
                        marqueeShape.remove();
                    } );
                    marqueeMode = false;
                }
            }
        };
    } )();

    return {
        "events": {
            mousedown: function ( e ) {
                var clickNode = e.getTargetNode();
                if ( !clickNode ) {
                    this.removeAllSelectedNodes();
                    marqueeActivator.selectStart( e );
                } else if ( e.originEvent.shiftKey ) {
                    this.toggleSelect( clickNode );
                } else if ( !clickNode.isSelected() ) {
                    this.select( clickNode, true );
                }
            },
            mousemove: marqueeActivator.selectMove,
            mouseup: function ( e ) {
                var clickNode = e.getTargetNode();
                if ( clickNode && clickNode.isSelected() && !this.isSingleSelect() ) {
                    this.select( clickNode, true );
                }
                marqueeActivator.selectEnd( e );
            }
        }
    };
} );