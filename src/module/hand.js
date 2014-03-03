var ViewDragger = kity.createClass( "ViewDragger", {
    constructor: function ( minder ) {
        this._minder = minder;
        this._enabled = false;
        this._offset = {
            x: 0,
            y: 0
        };
        this._bind();
    },
    isEnabled: function () {
        return this._enabled;
    },
    setEnabled: function ( value ) {
        var paper = this._minder.getPaper();
        paper.setStyle( 'cursor', value ? 'pointer' : 'default' );
        paper.setStyle( 'cursor', value ? '-webkit-grab' : 'default' );
        this._enabled = value;
    },
    move: function ( offset ) {
        this._minder.getRenderContainer().translate( offset.x, offset.y );
    },

    _bind: function () {
        var dragger = this,
            isRootDrag = false,
            lastPosition = null,
            currentPosition = null;

        this._minder.on( 'normal.beforemousedown', function ( e ) {
            // 点击未选中的根节点临时开启
            if ( e.getTargetNode() == this.getRoot() &&
                ( !this.getRoot().isSelected() || !this.isSingleSelect() ) ) {
                lastPosition = e.getPosition();
                dragger.setEnabled( true );
                isRootDrag = true;
                var me = this;
                setTimeout(function() {
                    me.setStatus('hand');
                }, 1);
            }
        } );

        this._minder.on( 'hand.beforemousedown', function ( e ) {
            // 已经被用户打开拖放模式
            if ( dragger.isEnabled() ) {
                lastPosition = e.getPosition();
                e.stopPropagation();
                e.originEvent.preventDefault();
            }
        } )

        .on( 'hand.beforemousemove', function ( e ) {
            if ( lastPosition ) {
                currentPosition = e.getPosition();

                // 当前偏移加上历史偏移
                var offset = kity.Vector.fromPoints( lastPosition, currentPosition );
                dragger.move( offset );
                e.stopPropagation();
                lastPosition = currentPosition;
            }
        } )

        .on( 'hand.mouseup', function ( e ) {
            lastPosition = null;

            // 临时拖动需要还原状态
            if ( isRootDrag ) {
                dragger.setEnabled( false );
                isRootDrag = false;
                this.rollbackStatus();
            }
        } );
    }
} );

KityMinder.registerModule( 'Hand', function () {

    var km = this;

    var ToggleHandCommand = kity.createClass( "ToggleHandCommand", {
        base: Command,
        execute: function ( minder ) {

            minder._viewDragger.setEnabled( !minder._viewDragger.isEnabled() );
            if ( minder._viewDragger.isEnabled() ) {
                minder.setStatus( 'hand' );
            } else {
                minder.rollbackStatus();
            }

        },
        queryState: function ( minder ) {
            return minder._viewDragger.isEnabled() ? 1 : 0;
        }
    } );

    return {
        init: function () {
            this._viewDragger = new ViewDragger( this );
        },
        commands: {
            'hand': ToggleHandCommand
        },
        events: {
            keyup: function ( e ) {
                if ( e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0 ) {
                    this.execCommand( 'hand' );
                    e.preventDefault();
                }
            },
            mousewheel: function ( e ) {
                var dx = e.originEvent.wheelDeltaX || 0,
                    dy = e.originEvent.wheelDeltaY || e.originEvent.wheelDelta;
                this._viewDragger.move( {
                    x: dx / 2.5,
                    y: dy / 2.5
                } );

                e.originEvent.preventDefault();
            },
            dblclick: function () {
                var viewport = this.getPaper().getViewPort();
                var offset = this.getRoot().getRenderContainer( this.getRenderContainer() ).getTransform().getTranslate();
                var dx = viewport.center.x - offset.x,
                    dy = viewport.center.y - offset.y;
                //this.getRenderContainer().fxTranslate(dx, dy, 300);
            }
        }
    };
} );