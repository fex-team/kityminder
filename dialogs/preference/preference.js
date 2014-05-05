( function () {
    var preferenceContent = '<div class="help-content" style="padding:20px;width:360px;">';
    preferenceContent += '<h3>展开属性设置</h3>';
    preferenceContent += '<p><label><input type="radio" name="expand" checked value="all"/>全部展开</label><label><input type="radio" name="expand" value="limit"/>局部展开</label></p>';
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
        initEvent: function ( km, $w ) {
            $w.on( 'click', '.kmui-close', function ( e ) {
                //写cookies
                var setCookie = function ( name, value, exp ) {
                    document.cookie = name + "=" + escape( value ) + ";expires=" + exp.toGMTString();
                }
                var expand = $( "input[type='radio'][name='expand']:checked" ).val();
                var Days = 30;
                var exp = new Date();
                exp.setTime( exp.getTime() + Days * 24 * 60 * 60 * 1000 );
                setCookie( 'expand', expand, exp );
                console.log( document.cookie );
            } );
        },
        width: 400
    } );
} )();