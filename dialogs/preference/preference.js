( function () {
    //todo 这里先写死成中文
    var preferenceContent = '<div class="help-content" style="padding:20px;width:360px;">';
    preferenceContent += '<h3>展开属性设置</h3>';
    preferenceContent += '<p><label><input type="checkbox" name="expand" />是否全部展开</label></p>';
    preferenceContent += '</div>';


    //todo 偏好设置暂时都在这里处理

    function execExpand(km,$w){
        var checked = $w.find('[name=expand]').checked();
        if(checked){

        }
    }
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

                km.fire('preferenceschange')
            } );
        },
        width: 400
    } );
} )();