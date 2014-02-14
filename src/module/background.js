var Grid = kity.createClass( 'Grid', {
	base: kity.Rect,
	constructor: function ( x, y, width, height, gridSize, color1, color2 ) {
		this.color1 = color1 || 'white';
		this.color2 = color2 || 'lightgray';
		this.gridSize = gridSize;
		this.callBase( width, height, x, y );
		this.draw();
	},
	draw: function () {
		var me = this;

		function lazyDraw() {
			var paper = me.getPaper();
			if ( !paper ) {
				return setTimeout( lazyDraw, 100 );
			}
			var size = me.gridSize;
			me.fill( new kity.PatternBrush().pipe( function () {
				this.setX( 0 ).setY( 0 );
				this.setWidth( size * 2 ).setHeight( size * 2 );
				this.addShape( new kity.Rect( size, size ).fill( me.color1 ) );
				this.addShape( new kity.Rect( size, size, size, size ).fill( me.color1 ) );
				paper.addResource( this );
			} ) ).setOpacity( 0 ).fadeIn( 500, 'ease' );
		}
		lazyDraw();
	}
} );

KityMinder.registerModule( 'Background', function () {
	function initBackground() {
		var start = kity.Color.createHSL( 200, 8, 30 );
		var end = start.dec( 'l', 5 );
		var paper = this.getPaper();

		var grid = new Grid( -50000, -50000, 100000, 100000, 2, start, end );
		paper.addShape( grid );
		grid.bringBack();
		paper.setStyle( 'background', end.toString() );
	}

	function resetBackground() {

	}

	return {
		events: {
			'ready': initBackground,
			'resize': resetBackground
		}
	};
} );