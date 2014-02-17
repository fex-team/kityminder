( function () {
    var utils = KM.utils;

    function hrefStartWith( href, arr ) {
        href = href.replace( /^\s+|\s+$/g, '' );
        for ( var i = 0, ai; ai = arr[ i++ ]; ) {
            if ( href.indexOf( ai ) == 0 ) {
                return true;
            }
        }
        return false;
    }

    KM.registerWidget( 'markers', {
        tpl: '<div class="kmui-modal" tabindex="-1" >' +
            '<div class="kmui-modal-header">' +
            '<div class="kmui-close" data-hide="modal"></div>' +
            '<h3 class="kmui-title"><%=title%></h3>' +
            '</div>' +
            '<div>' +
            '<h3>优先级</h3>' +
            '<ul class="icon-list" id="icon-priority"><li value="1">1</li><li value="2">2</li><li value="3">3</li><li value="4">4</li><li value="5">5</li></ul>' +
            '<h3>进程</h3>' +
            '<ul class="icon-list" id="icon-progress"><li value="1">1</li><li value="2">2</li><li value="3">3</li><li value="4">4</li><li value="5">5</li></ul>' +
            '</div>' +
            '</div>',
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.markers' );
            if ( lang ) {
                var html = $.parseTmpl( this.tpl, lang.static );
            }
            this.root().html( html );
        },
        initEvent: function ( km, $w ) {
            var link = km.queryCommandValue( 'link' );
            if ( link ) {
                $( '#kmui-link-Jhref', $w ).val( utils.html( $( link ).attr( 'href' ) ) );
                $( '#kmui-link-Jtitle', $w ).val( $( link ).attr( 'title' ) );
                $( link ).attr( 'target' ) == '_blank' && $( '#kmui-link-Jtarget' ).attr( 'checked', true )
            }
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
        width: 400
    } )
} )();