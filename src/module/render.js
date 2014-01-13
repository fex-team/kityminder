KityMinder.registerModule( "RenderModule", function () {
    var RenderNodeCommand = kity.createClass( "RenderNodeCommand", ( function () {
        var MinderNodeShape = kity.createClass( "MinderNodeShape", ( function () {
            return {
                constructor: function ( container ) {
                    this.rect = new kity.Rect();
                    this.text = new kity.Text();
                    this.shape = new kity.Group();
                    this.shape.addShapes( [ this.rect, this.text ] );
                    container.addShape( this.shape, "nodeShape" );
                },
                highlight: function () {
                    this.rect.stroke( new kity.Pen( "white", 3 ) );
                },
                unhighlight: function () {
                    this.rect.stroke( this.NormalInfo );
                }
            };
        } )() );
        var renderNode = function ( km, node ) {

            var styledefault = {
                radius: 10,
                fill: "yellow",
                stroke: "orange",
                color: "black",
                padding: [ 5, 10, 5, 10 ],
                fontSize: 20,
            };
            var kR = node.getRenderContainer();
            var nodeShape = kR.nodeShape = kR.nodeShape || new MinderNodeShape( kR );
            var nd = JSON.parse( JSON.stringify( styledefault ) );
            var nodeD = Utils.extend( nd, node.getData( "style" ) );
            node.setData( "style", nodeD );
            var _style = nodeD;
            nodeShape.text
                .setContent( node.getData( "text" ) || "Node" )
                .setSize( nodeD.fontSize )
                .fill( nodeD.color );
            var txtWidth = nodeShape.text.getWidth();
            var txtHeight = nodeShape.text.getHeight();
            var _padding = _style.padding;

            var _rectWidth = txtWidth + _padding[ 1 ] + _padding[ 3 ];
            var _rectHeight = txtHeight + _padding[ 0 ] + _padding[ 2 ];
            nodeShape.text
                .setX( _padding[ 3 ] ).setY( _padding[ 0 ] + txtHeight );

            nodeShape.NormalInfo = new kity.Pen( _style.stroke, _style.strokeWidth );
            nodeShape.rect.setWidth( _rectWidth ).setHeight( _rectHeight ).stroke( nodeShape.NormalInfo ).fill( _style.fill ).setRadius( _style.radius );
            switch ( node.getData( "align" ) ) {
            case "center":
                nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth / 2, node.getData( "y" ) - _rectHeight / 2 ) );
                break;
            case "right":
                nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth, node.getData( "y" ) - _rectHeight / 2 ) );
                break;
            default:
                nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ), node.getData( "y" ) - _rectHeight / 2 ) );
                break;
            }

            if ( km.isNodeSelected( node ) ) {
                nodeShape.highlight();
            }
        };
        var renderNodes = function ( km, node ) {
            if ( node instanceof Array ) {
                if ( node.length === 0 ) return false;
                for ( var i = 0; i < node.length; i++ ) {
                    renderNode( km, node[ i ] );
                }
            } else {
                renderNode( km, node );
            }
        };
        return {
            base: Command,
            execute: renderNodes
        };
    } )() );

    return {
        "init": function ( config ) {

        },
        "commands": {
            //todo:command字典，name－action  键值对模式编写
            "rendernode": RenderNodeCommand,
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