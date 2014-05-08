/*modal 类*/
KM.ui.define( 'modal', {
    tpl: '<div class="kmui-modal" tabindex="-1" >' +
        '<div class="kmui-modal-header">' +
        '<div class="kmui-close" data-hide="modal"></div>' +
        '<h3 class="kmui-title"><%=title%></h3>' +
        '</div>' +
        '<div class="kmui-modal-body"  style="<%if(width){%>width:<%=width%>px;<%}%>' +
        '<%if(height){%>height:<%=height%>px;<%}%>">' +
        ' </div>' +
        '<% if(cancellabel || oklabel) {%>' +
        '<div class="kmui-modal-footer">' +
        '<div class="kmui-modal-tip"></div>' +
        '<%if(oklabel){%><div class="kmui-btn kmui-btn-primary" data-ok="modal"><%=oklabel%></div><%}%>' +
        '<%if(cancellabel){%><div class="kmui-btn" data-hide="modal"><%=cancellabel%></div><%}%>' +
        '</div>' +
        '<%}%></div>',
    defaultOpt: {
        title: "",
        cancellabel: "",
        oklabel: "",
        width: '',
        height: '',
        backdrop: true,
        keyboard: true
    },
    init: function ( options ) {
        var me = this;

        me.root( $( $.parseTmpl( me.tpl, options || {} ) ) );

        me.data( "options", options );
        if ( options.okFn ) {
            me.on( 'ok', $.proxy( options.okFn, me ) )
        }
        if ( options.cancelFn ) {
            me.on( 'beforehide', $.proxy( options.cancelFn, me ) )
        }

        me.root().delegate( '[data-hide="modal"]', 'click', $.proxy( me.hide, me ) )
            .delegate( '[data-ok="modal"]', 'click', $.proxy( me.ok, me ) );

        $( '[data-hide="modal"],[data-ok="modal"]', me.root() ).hover( function () {
            $( this ).toggleClass( 'kmui-hover' )
        } );

        setTimeout( function () {
            $( '.kmui-modal' ).draggable( {
                handle: '.kmui-modal-header'
            } );
        }, 100 );
    },
    toggle: function () {
        var me = this;
        return me[ !me.data( "isShown" ) ? 'show' : 'hide' ]();
    },
    show: function () {
        var me = this;

        me.trigger( "beforeshow" );

        if ( me.data( "isShown" ) ) return;

        me.data( "isShown", true );

        me.escape();

        me.backdrop( function () {
            me.autoCenter();
            me.root()
                .show()
                .focus()
                .trigger( 'aftershow' );
        } );

        $( '.kmui-modal' ).draggable( {
            handle: '.kmui-modal-header'
        } );
    },
    showTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).html( text ).fadeIn();
    },
    hideTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).fadeOut( function () {
            $( this ).html( '' );
        } );
    },
    autoCenter: function () {
        //ie6下不用处理了
        !$.IE6 && this.root().css( "margin-left", -( this.root().width() / 2 ) );
    },
    hide: function () {
        var me = this;

        me.trigger( "beforehide" );

        if ( !me.data( "isShown" ) ) return;

        me.data( "isShown", false );

        me.escape();

        me.hideModal();
    },
    escape: function () {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).keyboard ) {
            me.root().on( 'keyup', function ( e ) {
                e.which == 27 && me.hide();
            } )
        } else if ( !me.data( "isShown" ) ) {
            me.root().off( 'keyup' );
        }
    },
    hideModal: function () {
        var me = this;
        me.root().hide();
        me.backdrop( function () {
            me.removeBackdrop();
            me.trigger( 'afterhide' );
        } )
    },
    removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    },
    backdrop: function ( callback ) {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).backdrop ) {
            me.$backdrop = $( '<div class="kmui-modal-backdrop" />' ).click(
                me.data( "options" ).backdrop == 'static' ?
                $.proxy( me.root()[ 0 ].focus, me.root()[ 0 ] ) : $.proxy( me.hide, me )
            )
        }
        me.trigger( 'afterbackdrop' );
        callback && callback();

    },
    attachTo: function ( $obj ) {
        var me = this
        if ( !$obj.data( '$mergeObj' ) ) {

            $obj.data( '$mergeObj', me.root() );
            $obj.on( 'wrapclick', function () {
                me.toggle( $obj )
            } );
            me.data( '$mergeObj', $obj )
        }
    },
    ok: function () {
        var me = this;
        me.trigger( 'beforeok' );
        if ( me.trigger( "ok", me ) === false ) {
            return;
        }
        me.hide();
    },
    getBodyContainer: function () {
        return this.root().find( '.kmui-modal-body' )
    }
} );