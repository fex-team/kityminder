KityMinder.registerModule( "RenderModule", ( function () {
        var RenderRootCommand = kity.createClass( "RenderRootCommand", ( function () {
            var node_default = {
                x: 0,
                y: 0,
                radius: 5,
                text: "Root",
                fill: "#7ecef4",
                stroke: "white"
            };
            var drawRectNode = function ( kR, node ) {
                if ( !node ) {
                    node = node_default;
                }
                var _rect = new kity.Rect();
                _rect.setRadius( node.radius );
                return _rect;
            };
            return {
                base: Command,
                execute: function ( km, node ) {
                    var kR = km.getRenderContainer();
                    var _root = km.getRoot() || new MinderNode();
                    var shape = new kity.Group();
                    var _rect = drawRectNode( node );
                    shape.addShape( _rect, "background" );
                }
            };
        } )() );

        // var DrawShapeCommand = kity.createClass( "DrawShapeCommand", {
        //     base: Command,
        //     execute: function ( km, node ) {
        //         var dR = km.getRenderContainer();
        //         node = node || km.getRoot();
        //         km.traverse( node, function ( current ) {
        //             var rc = current.getRenderContainer();
        //             var x = current.getData( 'x' ) || 0,
        //                 y = current.getData( 'y' ) || 0;
        //             rc.setTransform( new kity.Matrix().translate( x, y ) );
        //             if ( !rc.rect ) {
        //                 rc.rect = new kity.Rect();
        //                 rc.addShape( rc.rect );
        //                 rc.rect.fill( '#eee' );
        //                 rc.rect.setRadius( 5 );
        //             }

        //             if ( !rc.text ) {
        //                 rc.text = new kity.Text();
        //                 rc.addShape( rc.text );
        //             }
        //             rc.text.setContent( current.getData( 'text' ) || '' );
        //             var box = rc.text.getRenderBox();
        //             rc.rect.setPosition( box.x - 5, box.y - 5 );
        //             rc.rect.setSize( box.width + 10, box.height + 10 );
        //         } );
        //     }
        // } );

        return {
            "commands": {
                //todo:command字典，name－action  键值对模式编写
                "renderroot": RenderRootCommand
            },

            "events": {
                //todo:事件响应函数绑定列表,事件名-响应函数  键值对模式编写
                "click": function ( e ) {

                },
                "keydown keyup": function ( e ) {

                }
            }
        };
    } );