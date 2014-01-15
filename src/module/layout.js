KityMinder.registerModule( "LayoutModule", function () {
	var SwitchLayoutCommand = kity.createClass( "SwitchLayoutCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, style ) {
				var _style = km.getLayoutStyle( style );
				if ( !_style ) return false;
				km.renderNode = _style.renderNode;
				km.initStyle = _style.initStyle;
				km.createChildNode = _style.createChildNode;
				km.createSiblingNode = _style.createSiblingNode;
				km.removeNode = _style.removeNode;
				//清空节点上附加的数据
				var _root = km.getRoot();
				_root.preTraverse( function ( node ) {
					node.clearData();
					node.getRenderContainer().clear();
				} );
				km.initStyle();
				return style;
			}
		};
	} )() );
	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, parent ) {
				return km.createChildNode( parent );
			}
		};
	} )() );
	var CreateSiblingNodeCommand = kity.createClass( "CreateSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, sibling ) {
				return km.createSiblingNode( sibling );
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				km.removeNode( node );
			}
		};
	} )() );

	return {
		"commands": {
			"createchildnode": CreateChildNodeCommand,
			"createsiblingnode": CreateSiblingNodeCommand,
			"removenode": RemoveNodeCommand,
			"switchlayout": SwitchLayoutCommand
		}
	};
} );