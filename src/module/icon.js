KityMinder.registerModule( "IconModule", function () {
	var renderPriorityIcon = function ( node, val ) {
		var colors = [ "", "#A92E24", "#29A6BD", "#1E8D54", "#eb6100", "#876DDA" ];
		var _bg = new kity.Rect().fill( colors[ val ] ).setRadius( 3 ).setWidth( 20 ).setHeight( 20 );
		var _number = new kity.Text().setContent( val ).fill( "white" ).setSize( 12 );
		var _rc = new kity.Group();
		_rc.addShapes( [ _bg, _number ] );
		node.getIconRc().addShape( _rc );
		_number.setTransform( new kity.Matrix().translate( 6, 15 ) );
	};
	var renderProgressIcon = function ( node, val, left ) {
		var _rc = new kity.Group();
		var _bg = new kity.Circle().setRadius( 8 ).fill( "white" ).stroke( new kity.Pen( "#29A6BD", 2 ) );
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
			var check = new kity.Path();
			_percent.addShapes( [ new kity.Circle().setRadius( 6 ).fill( "#29A6BD" ), check ] );
			check.getDrawer().moveTo( -3, 0 ).lineTo( -1, 3 ).lineTo( 3, -2 );
			check.stroke( new kity.Pen( "white", 2 ).setLineCap( "round" ) );
			break;
		}
		if ( val < 5 ) d.close();
		_percent.fill( "#29A6BD" );
	};
	var setPriorityCommand = kity.createClass( "SetPriorityCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( "PriorityIcon", value );
					km.updateLayout( nodes[ i ] );
				}
			},
			queryValue: function ( km ) {
				var nodes = km.getSelectedNodes();
				var val;
				for ( var i = 0; i < nodes.length; i++ ) {
					val = nodes[ i ].getData( "PriorityIcon" );
					if ( val ) break;
				}
				return val;
			}
		};
	} )() );
	var setProgressCommand = kity.createClass( "SetProgressCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( "ProgressIcon", value );
					km.updateLayout( nodes[ i ] );
				}
			},
			queryValue: function ( km ) {
				var nodes = km.getSelectedNodes();
				var val;
				for ( var i = 0; i < nodes.length; i++ ) {
					val = nodes[ i ].getData( "ProgressIcon" );
					if ( val ) break;
				}
				return val;
			}
		};
	} )() );
	return {
		"commands": {
			"setpriority": setPriorityCommand,
			"setprogress": setProgressCommand
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
				else textShape.setTransform( new kity.Matrix().translate( 0, 0 ) );
			}
		}
	};
} );