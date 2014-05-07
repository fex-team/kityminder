( function () {
    //todo 这里先写死成中文
    var content = '<div class="hyperlink-content" style="padding:20px;width:360px;">';
    content += '<p><label>输入链接: <input id="hyperlink_href" style="width:90%;" /></label></p>';
    content += '<p style="text-align:right"><button id="hyperlink_insert">插入</button></p>';
    content += '</div>';




    KM.registerWidget( 'hyperlink', {
        tpl: content,
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.hyperlink' ),
                html;
            if ( lang ) {
                html = $.parseTmpl( this.tpl, lang );
            }
            this.root().html( html );
        },
        initEvent: function ( km, $w ) {
            $w.find('#hyperlink_insert').on('click',function(){
                km.execCommand('hyperlink',$w.find('#hyperlink_href').val());
                $w.kmui().hide();
            });
            var url = km.queryCommandValue('hyperlink');

            var $input = $w.find('#hyperlink_href');
            $input.val(url || 'http://');
            setTimeout(function(){
                $input.focus()
            })
        },
        width: 400
    } );
} )();