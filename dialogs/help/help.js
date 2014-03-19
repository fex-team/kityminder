( function () {
    var utils = KM.utils;
    KM.registerWidget( 'help', {
        tpl: "<div></div>",
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.markers' );
            if ( lang ) {
                var html = $.parseTmpl( this.tpl, lang );
            }
            this.root().html( html );
        },
        initEvent: function ( km, $w ) {
            $w.on( "click", "li", function () {
                var $this = $( this );
                $this.siblings().removeClass( "active" );
                $this.toggleClass( "active" );
                var val = $this.val();
                if ( !$this.hasClass( "active" ) ) {
                    val = null;
                }
                var type = $this.attr( "type" );
                km.execCommand( type, val );
            } );
            km.on( 'interactchange', function ( e ) {
                var valPri = this.queryCommandValue( "priority" );
                var valPro = this.queryCommandValue( "progress" );
                $w.find( "li[type='priority']" ).removeClass( "active" );
                $w.find( "li[type='priority'][value='" + valPri + "']" ).addClass( "active" );
                $w.find( "li[type='progress']" ).removeClass( "active" );
                $w.find( "li[type='progress'][value='" + valPro + "']" ).addClass( "active" );
            } );
        },
        buttons: {
            'ok': {
                exec: function ( km, $w ) {
                    var href = $( '#kmui-link-Jhref' ).val().replace( /^\s+|\s+$/g, '' );

                    if ( href ) {
                        km.execCommand( 'link', {
                            'href': href,
                            'target': $( "#kmui-link-Jtarget:checked" ).length ? "_blank" : '_self',
                            'title': $( "#kmui-link-Jtitle" ).val().replace( /^\s+|\s+$/g, '' ),
                            '_href': href
                        } );
                    }
                }
            },
            'cancel': {}
        },
        width: 200

    } )
} )();