var GM = KityMinder.Geometry;

var AreaAnimator = kity.createClass( "AreaAnimator", {
	base: kity.Animator,
	constructor: function ( startArea, endArea ) {
		startArea.opacity = 0;
		endArea.opacity = 0.8;
		this.callBase( startArea, endArea, function ( target, value ) {
			target.setPosition( value.x, value.y );
			target.setSize( value.width, value.height );
			target.setOpacity( value.opacity );
		} );
	}
} );

var DragBox = kity.createClass( "DragBox", {
	base: kity.Group,
	constructor: function ( shapeArray, focusPoint ) {
		this.callBase();
		this._targetCount = shapeArray.length;
		this._focusPoint = focusPoint;
		this._targetArea = this._calcStartArea( shapeArray );
		this._dragArea = this._calcDragArea( focusPoint );
		this._draw();
	},
	_calcStartArea: function ( shapeArray ) {
		var area = shapeArray.pop().getRenderBox();
		while ( shapeArray.length ) {
			area = GM.mergeBox( area, shapeArray.pop().getRenderBox() );
		}
		return {
			x: area.left,
			y: area.top,
			width: area.width,
			height: area.height
		};
	},
	_calcDragArea: function ( focusPoint ) {
		var width = 80,
			height = 30;
		return {
			x: focusPoint.x - width / 2,
			y: focusPoint.y - height / 2,
			width: width,
			height: height
		};
	},
	_draw: function ( container ) {
		var d = this._dragArea;
		this._rect = new kity.Rect().fill( 'white' ).stroke( '#3399ff', 1 );
		this.addShape( this._rect.setRadius( 5 ) );
		this.addShape( new kity.Text( this._targetCount + ' item' )
			.setPosition( this._focusPoint.x, this._focusPoint.y + 5 )
			.setSize( 14 )
			.setTextAnchor( 'middle' )
			.fill( 'black' )
			.setStyle( 'cursor', 'default' ) );
	},
	shrink: function () {
		var animator = new AreaAnimator( this._targetArea, this._dragArea );
		animator.start( this._rect, 400, 'easeOutQuint' );
	},
	green: function () {
		this._rect.stroke( 'green', 2 ).setOpacity( 1 );
	},
	blue: function () {
		this._rect.stroke( '#3399ff', 1 ).setOpacity( 0.8 );
	}
} );


function findAllAncestor( nodes ) {
	var ancestors = [],
		judge;

	function hasAncestor( nodes, judge ) {
		for ( var i = nodes.length - 1; i >= 0; --i ) {
			if ( nodes[ i ].isAncestorOf( judge ) ) return true;
		}
		return false;
	}

	nodes.sort( function ( node1, node2 ) {
		return node1.getLevel() - node2.getLevel();
	} );

	while ( ( judge = nodes.pop() ) ) {
		if ( !hasAncestor( nodes, judge ) ) {
			ancestors.push( judge );
		}
	}
	return ancestors;
}

function findAvailableParents( nodes, root ) {
	var availables = [],
		i;
	availables.push( root );
	root.getChildren().forEach( function ( test ) {
		for ( i = 0; i < nodes.length; i++ ) {
			if ( nodes[ i ] == test ) return;
		}
		availables = availables.concat( findAvailableParents( nodes, test ) );
	} );
	return availables;
}

var lastActivedDropTarget = null;
function activeDropTarget( node ) {
	if(lastActivedDropTarget != node) {
		node.getRenderContainer().fxScale(1.6, 1.6, 200, 'ease').fxScale(1/1.6, 1/1.6, 300, 'ease');
		lastActivedDropTarget = node;
	}
}

KityMinder.registerModule( "DragTree", function () {
	var dragStartPosition, dragBox, dragTargets, dropTargets, dragTargetBoxes, dropTarget;

	return {
		events: {
			mousedown: function ( e ) {
				var clickNode = e.getTargetNode();

				if ( !clickNode ) {
					return;
				}

				dragStartPosition = e.getPosition();

			},
			mousemove: function ( e ) {
				var currentPosition;

				if ( !dragStartPosition ) return;

				currentPosition = e.getPosition();

				if ( !dragBox ) {
					if ( GM.getDistance( currentPosition, dragStartPosition ) < 10 ) {
						return;
					}
					dragTargets = findAllAncestor( this.getSelectedNodes().slice( 0 ) );
					dropTargets = findAvailableParents( dragTargets, this.getRoot() );
					dragBox = new DragBox( dragTargets.map( function ( target ) {
						return target.getRenderContainer();
					} ), currentPosition );
					this.getRenderContainer().addShape( dragBox );
					dragBox.shrink();
				}

				dragBox.setTransform( new kity.Matrix().translate( currentPosition.x - dragStartPosition.x, currentPosition.y - dragStartPosition.y ) );

				if ( dropTarget ) {
					//dropTarget.getRenderContainer().scale( 0.8 );
					dragBox.blue();
					dropTarget = null;
				}

				dropTargets.forEach( function ( test ) {
					if ( !dropTarget && GM.isBoxIntersect( dragBox.getRenderBox(), test.getRenderContainer().getRenderBox() ) ) {
						activeDropTarget(test);
						//test.getRenderContainer().scale( 1.25 );
						dropTarget = test;
						dragBox.green();
					}
				} );
				if( !dropTarget ) {
					lastActivedDropTarget = null;
				}
			},
			mouseup: function ( e ) {
				dragStartPosition = null;
				if ( dragBox ) {
					dragBox.remove();
					dragBox = null;
					if ( dropTarget ) {
						for(var i = dragTargets.length - 1, target; i >= 0; i--) {
							target = dragTargets[i];
							if ( target.parent ) {
								target.parent.removeChild( target );
								dropTarget.appendChild( target );
							}
						}
						this.removeAllSelectedNodes();
						this.initStyle( this.getRoot() );
					}
				}
			}
		}
	};
} );