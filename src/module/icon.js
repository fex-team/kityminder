KityMinder.registerModule( "IconModule", function () {
	var PriorityIcon = kity.createClass( "PriorityIcon", ( function () {
		var colors = [ "", "red", "blue", "green", "orange", "purple" ];
		return {
			constructor: function ( node, value ) {
				this._node = node;
				this._bg = new kity.Rect().fill( colors[ value ] ).setRadius( 3 ).setWidth( 20 ).setHeight( 20 );
				// this._number = new kity.Text().setContent( value ).fill( "white" ).setSize( 12 );
				this._rc = new kity.Group();
				this._rc.addShape( this._bg );
				node.getIconRc().addShape( this._rc );
			},
			setValue: function ( val ) {
				// this._number.setContent( val );
			},
			getShape: function () {
				return this._rc;
			},
			remove: function () {
				this._node.setData( "PriorityIcon", null );
				this._rc.remove();
			}
		};
	} )() );
	var ProgressIcon = kity.createClass( "PriorityIcon", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var iconRc = node.getIconRc();
			},
			setValue: function ( val ) {

			},
			getShape: function () {
				return this._rc;
			},
			remove: function () {
				this._node.setData( "ProgressIcon", null );
				this._rc.remove();
			}
		};
	} )() );
	var icons = {
		"PriorityIcon": PriorityIcon,
		"ProgressIcon": ProgressIcon
	};
	var ChangeIconCommand = kity.createClass( "AddIconCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, iconType, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					var iconRc = nodes[ i ].getIconRc();
					var icon = nodes[ i ].getData( iconType );
					if ( icon ) {
						icon.setValue( value );
					} else {
						nodes[ i ].setData( iconType, new icons[ iconType ]( nodes[ i ], value ) );
						km.updateLayout( nodes[ i ] );
					}
				}
			}
		};
	} )() );
	var RemoveIconCommand = kity.createClass( "RemoveIconCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, iconType ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					var icon = nodes[ i ].getData( iconType );
					km.updateLayout( nodes[ i ] );
					icon.remove();
				}
			}
		};
	} )() );
	return {
		"commands": {
			"changeicon": ChangeIconCommand,
			"removeicon": RemoveIconCommand
		},
		"events": {
			"RenderNode": function ( e ) {
				var node = e.node;
				var iconRc = node.getIconRc();
				//依次排布图标、文字
				iconRc.setTransform( new kity.Matrix().translate( 0, -20 ) );
				var iconWidth = iconRc.getWidth();
				var textShape = node.getTextShape();
				if ( iconWidth ) textShape.setTransform( new kity.Matrix().translate( iconWidth + 5, 0 ) );
			}
		}
	};
} );