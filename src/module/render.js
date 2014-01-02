KityMinder.registerModule( "RenderModule", function () {
    var RenderNodeCommand = kity.createClass( "RenderNodeCommand", ( function () {
        var node_default = {
            centerX: 0,
            centerY: 0,
            radius: 5,
            text: "Root",
            fill: "#7ecef4",
            stroke: "white",
            padding: 5
        };
        var renderNode = function ( km, node ) {
            var nodeD = Utils.extend( node_default, node );
            var kR = km.getRenderContainer();
            var _node = new kity.Group();
            var _txt = new kity.Text( nodeD.text || "Node" );
            _txt.setSize( nodeD.fontSize ).fill( nodeD.color );
            _node.addShape( _txt );
            kR.addShape( _node );
            var txtWidth = _txt.getWidth();
            var txtHeight = _txt.getHeight();
            var _padding = nodeD.padding;

            var _rectWidth = txtWidth + _padding[ 1 ] + _padding[ 3 ];
            var _rectHeight = txtHeight + _padding[ 0 ] + _padding[ 2 ];
            console.log( _rectWidth, _rectHeight );
            var _rect = new kity.Rect( _rectWidth, _rectHeight, 0, 0, nodeD.radius );
            _rect.stroke( nodeD.stroke ).fill( nodeD.fill );
            _node.addShape( _rect ).bringTop( _txt );
            _node.translate( nodeD.centerX - _rectWidth / 2, nodeD.centerY - _rectHeight / 2 );
            _txt.setX( _padding[ 3 ] ).setY( _padding[ 0 ] + txtHeight );
        };

        return {
            base: Command,
            execute: function ( km, nodeData ) {
                renderNode( km, node );
            }
        };
    } )() );

    return {
        "init": function ( config ) {

        },
        "commands": {
            //todo:command字典，name－action  键值对模式编写
            "rendernode": RenderNodeCommand
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