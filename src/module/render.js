KityMinder.registerModule( "RenderModule", function () {
    var RenderRootCommand = kity.createClass( "RenderRootCommand", ( function () {
        var node_default = {
            x: 0,
            y: 0,
            radius: 5,
            text: "Root",
            fill: "#7ecef4",
            stroke: "white",
            padding: 5
        };
        var drawRectNode = function ( node ) {
            if ( !node ) {
                node = node_default;
            } else {
                for ( var key in node_default ) {
                    node[ key ] = node[ key ] || node_default[ key ];
                }
            }
            var _node = new kity.Group();
            var _rect = new kity.Rect();
            var _text = new kity.Text( node.text );
            _rect
                .setRadius( node.radius )
                .setSize( 100, 100 )
                .setPosition( 0, 0 )
                .fill( node.fill )
                .stroke( node.stroke );
            _text.setX( 30 ).setY( 30 );
            console.log( _text.getWidth() );
            _node.addItems( [ _rect, _text ] );
            return _node;
        };
        return {
            base: Command,
            execute: function ( km, node ) {
                var kR = km.getRenderContainer();
                var _root = km.getRoot() || new MinderNode();
                var _node = drawRectNode( node );
                console.log( _node.getShapes()[ 1 ] );
                kR.addShape( _node, "node" );
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