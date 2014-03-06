( function () {
    var utils = KM.utils;
    KM.registerWidget( 'markers', {
        tpl: "<ul class='icon-list priority'>" +
            "<li value='1' type='priority'><span class='icon p1'></span><span><%= priority %>1</span></li>" +
            "<li value='2' type='priority'><span class='icon p2'></span><span><%= priority %>2</span></li>" +
            "<li value='3' type='priority'><span class='icon p3'></span><span><%= priority %>3</span></li>" +
            "<li value='4' type='priority'><span class='icon p4'></span><span><%= priority %>4</span></li>" +
            "<li value='5' type='priority'><span class='icon p5'></span><span><%= priority %>5</span></li>" +
            "</ul>" +
            "<ul class='icon-list progress'>" +
            "<li value='1' type='progress'><span class='icon p1'></span><span><%= progress.notdone %></span></li>" +
            "<li value='2' type='progress'><span class='icon p2'></span><span><%= progress.quarterdone %></span></li>" +
            "<li value='3' type='progress'><span class='icon p3'></span><span><%= progress.halfdone %></span></li>" +
            "<li value='4' type='progress'><span class='icon p4'></span><span><%= progress.threequartersdone %></span></li>" +
            "<li value='5' type='progress'><span class='icon p5'></span><span><%= progress.done %></span></li>" +
            "</ul>",
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