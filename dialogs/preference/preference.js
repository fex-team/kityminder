( function () {
    var preferenceContent = '<div class="help-content" style="padding:20px;width:360px;">';
    preferenceContent += '<h2>设置</h2>'
    preferenceContent += '</div>';

    KM.registerWidget( 'preference', {
        tpl: preferenceContent,
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.help' ),
                html;
            if ( lang ) {
                html = $.parseTmpl( this.tpl, lang );
            }
            this.root().html( html );
        },
        initEvent: function ( km, $w ) {},
        width: 400
    } );
} )();