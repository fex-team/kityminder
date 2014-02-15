KityMinder.Geometry = ( function () {
	var g = {};
	var min = Math.min,
		max = Math.max,
		abs = Math.abs;
	var own = Object.prototype.hasOwnProperty;

	g.isNumberInRange = function ( number, range ) {
		return number > range[ 0 ] && number < range[ 1 ];
	};

	g.getBox = function ( p1, p2 ) {
		return {
			left: min( p1.x, p2.x ),
			right: max( p1.x, p2.x ),
			top: min( p1.y, p2.y ),
			bottom: max( p1.y, p2.y ),
			width: abs( p1.x - p2.x ),
			height: abs( p1.y - p2.y )
		};
	};

	g.mergeBox = function ( b1, b2 ) {
		return {
			left: min( b1.left, b2.left ),
			right: max( b1.right, b2.right ),
			top: min( b1.top, b2.top ),
			bottom: max( b1.bottom, b2.bottom )
		};
	};

	g.getBoxRange = function ( box ) {
		return {
			x: [ box.left, box.right ],
			y: [ box.top, box.bottom ]
		};
	};

	g.getBoxVertex = function ( box ) {
		return {
			leftTop: {
				x: box.left,
				y: box.top
			},
			rightTop: {
				x: box.right,
				y: box.top
			},
			leftBottom: {
				x: box.left,
				y: box.bottom
			},
			rightBottom: {
				x: box.right,
				y: box.bottom
			}
		};
	};

	g.isPointInsideBox = function ( p, b ) {
		var ranges = g.getBoxRange( b );
		return g.isNumberInRange( p.x, ranges.x ) && g.isNumberInRange( p.y, ranges.y );
	};

	g.isBoxIntersect = function ( b1, b2 ) {
		var v = g.getBoxVertex( b1 );
		return g.isPointInsideBox( v.leftTop, b2 ) || g.isPointInsideBox( v.rightTop, b2 ) || g.isPointInsideBox( v.leftBottom, b2 ) || g.isPointInsideBox( v.rightBottom, b2 );
	};

	g.snapToSharp = function ( unknown ) {
		if ( utils.isNumber( unknown ) ) {
			return ( unknown | 0 ) + 0.5;
		}
		if ( utils.isArray( unknown ) ) {
			return unknown.map( g.snapToSharp );
		}
		[ 'x', 'y', 'left', 'top', 'right', 'bottom' ].forEach( function ( n ) {
			if ( own.call( unknown, n ) ) {
				unknown[ n ] = g.snapToSharp( unknown[ n ] );
			}
		} );
		return unknown;
	};

	return g;
} )();