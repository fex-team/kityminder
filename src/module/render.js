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

    return {
        "init": function ( config ) {

        },
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