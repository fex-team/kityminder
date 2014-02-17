KityMinder.registerModule( "IconModule", function () {
	var renderPriorityIcon = function ( node, val ) {
		var colors = [ "", "red", "blue", "green", "orange", "purple" ];
		var _bg = new kity.Rect().fill( colors[ val ] ).setRadius( 3 ).setWidth( 20 ).setHeight( 20 );
		var _number = new kity.Text().setContent( val ).fill( "white" ).setSize( 12 );
		var _rc = new kity.Group();
		_rc.addShapes( [ _bg, _number ] );
		node.getIconRc().addShape( _rc );
		_number.setTransform( new kity.Matrix().translate( 6, 15 ) );
	};
	var renderProgressIcon = function ( node, val, left ) {
		var _rc = new kity.Group();
		var _bg = new kity.Circle().setRadius( 8 ).fill( "white" ).stroke( new kity.Pen( "blue", 2 ) );
		var _percent, d;
		if ( val < 5 ) {
			_percent = new kity.Path();
			d = _percent.getDrawer();
			d.moveTo( 0, 0 ).lineTo( 6, 0 );
		} else _percent = new kity.Group();
		_rc.addShapes( [ _bg, _percent ] );
		node.getIconRc().addShape( _rc );
		_rc.setTransform( new kity.Matrix().translate( left, 10 ) );
		_percent.setTransform( 10, 10 );
		switch ( val ) {
		case 1:
			break;
		case 2:
			d.carcTo( 6, 0, -6 );
			break;
		case 3:
			d.carcTo( 6, -6, 0 );
			break;
		case 4:
			d.carcTo( 6, 0, 6, 1, 0 );
			break;
		case 5:
			_percent.addShape( new kity.Circle().setRadius( 6 ).fill( "blue" ) );
			break;
		}
		if ( val < 5 ) d.close();
		_percent.fill( "blue" );
	};
	var ChangeIconCommand = kity.createClass( "AddIconCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, iconType, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( iconType, value );
					km.updateLayout( nodes[ i ] );
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
					nodes[ i ].setData( iconType, null );
					km.updateLayout( nodes[ i ] );
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
				var PriorityIconVal = node.getData( "PriorityIcon" );
				var ProgressIconVal = node.getData( "ProgressIcon" );
				//依次排布图标、文字
				iconRc.setTransform( new kity.Matrix().translate( 0, -20 ) );
				iconRc.clear();
				var PriorityIconWidth = 0;
				if ( PriorityIconVal ) {
					renderPriorityIcon( node, PriorityIconVal );
					PriorityIconWidth = 22;
				}
				if ( ProgressIconVal ) {
					renderProgressIcon( node, ProgressIconVal, PriorityIconWidth + 10 );
				}
				var iconWidth = iconRc.getWidth();
				var textShape = node.getTextShape();
				if ( iconWidth ) textShape.setTransform( new kity.Matrix().translate( iconWidth + 5, 0 ) );
			}
		}
	};
} );