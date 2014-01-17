KityMinder.registerModule( "LayoutModule", function () {
	var switchLayout = function ( km, style ) {
		var _style = km.getLayoutStyle( style );
		if ( !_style ) return false;
		km.renderNode = _style.renderNode;
		km.initStyle = _style.initStyle;
		km.appendChildNode = _style.appendChildNode;
		km.appendSiblingNode = _style.appendSiblingNode;
		km.removeNode = _style.removeNode;
		//清空节点上附加的数据
		var _root = km.getRoot();

		_root.preTraverse( function ( node ) {
			node.clearData();
			node.getRenderContainer().clear();
		} );
		km.initStyle();
		return style;
	};
	var SwitchLayoutCommand = kity.createClass( "SwitchLayoutCommand", ( function () {
		return {
			base: Command,
			execute: switchLayout
		};
	} )() );
	var AppendChildNodeCommand = kity.createClass( "AppendChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				var parent = km.getSelectedNode();
				km.appendChildNode( parent, node );
				km.select( node );
				return node;
			}
		};
	} )() );
	var AppendSiblingNodeCommand = kity.createClass( "AppendSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				//km.select( node );
				var sibling = km.getSelectedNode();
				km.appendSiblingNode( sibling, node );
				km.select( node );
				return node;
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, nodes ) {
				km.removeNode( nodes );
			}
		};
	} )() );

	return {
		"commands": {
			"appendchildnode": AppendChildNodeCommand,
			"appendsiblingnode": AppendSiblingNodeCommand,
			"removenode": RemoveNodeCommand,
			"switchlayout": SwitchLayoutCommand
		},
		"events": {
			"ready": function () {
				alert( "ready" );
				switchLayout( this, this.getOptions( 'layoutstyle' ) );
			}
		}
	};
} );