KityMinder.registerModule( "LayoutModule", function () {
	kity.extendClass( MinderNode, {
		setLayout: function ( k, v ) {
			if ( this.setData( 'layout' ) === undefined ) {
				this.setData( 'layout', {} );
			}
			var _pros = this.getLayout();
			Utils.extend( _pros, {
				k: v
			} );
			this.setData( 'layout', _pros );
		},
		getLayout: function ( k ) {
			if ( k === undefined ) {
				return this.getData( 'layout' );
			}
			return this.getData( 'layout' )[ k ];
		},
		clearLayout: function () {
			this.setData( 'layout', {} );
			this.getRenderContainer().clear();
		}
	} );
	var switchLayout = function ( km, style ) {
		var _style = km.getLayoutStyle( style );
		if ( !_style ) return false;
		km.renderNode = _style.renderNode;
		km.initStyle = _style.initStyle;
		km.appendChildNode = _style.appendChildNode;
		km.appendSiblingNode = _style.appendSiblingNode;
		km.removeNode = _style.removeNode;
		km.updateLayout = _style.updateLayout;
		//清空节点上附加的数据
		var _root = km.getRoot();
		_root.preTraverse( function ( node ) {
			node.clearLayout();
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
				var selectedNode = km.getSelectedNode();
				if ( selectedNode.isRoot() ) {
					km.appendChildNode( selectedNode, node );
				} else {
					km.appendSiblingNode( selectedNode, node );
				}
				km.select( node );
				return node;
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				var selectedNodes = km.getSelectedNodes();
				km.removeNode( selectedNodes );
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
				switchLayout( this, this.getOptions( 'layoutstyle' ) );
			}
		}
	};
} );