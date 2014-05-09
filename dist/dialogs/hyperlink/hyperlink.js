( function ( utils ) {
    //todo 这里先写死成中文
    var content = '<div class="hyperlink-content" style="padding:20px;width:360px;">';
    content += '<style>';
    content += '.kmui-dialog-<%= container %> input{';
    content += 'width: 75%;';
    content += 'padding: 6px 12px;';
    content += 'font-size: 14px;';
    content += 'line-height: 1.42857143;';
    content += 'color: #555;';
    content += 'background-color: #fff;';
    content += 'background-image: none;';
    content += 'border: 1px solid #ccc;';
    content += 'border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba( 0, 0, 0, .075 );'
    content += 'box-shadow: inset 0 1px 1px rgba( 0, 0, 0, .075 ); -webkit-transition: border-color ease-in-out .15s,';
    content += 'box-shadow ease-in-out .15s;';
    content += 'transition: border-color ease-in-out .15s,';
    content += 'box-shadow ease-in-out .15s;';
    content += '}';
    content += '.kmui-dialog-<%= container %> input:focus{';
    content += 'border-color: #66afe9;';
    content += 'outline: 0;';
    content += '-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);';
    content += 'box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);';
    content += '}';
    content += '.kmui-dialog-<%= container %> button{';
    content += 'height:34px;';
    content += 'line-height:34px;';
    content += 'vertical-align:1px';
    content += '}';
    content += '</style>';
    content += '<input id="hyperlink_href"/>';
    content += '<button id="hyperlink_insert">插入</button>';
    content += '</div>';



    KM.registerWidget( 'hyperlink', {
        tpl: content,
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.hyperlink' ),
                html;
            if ( lang ) {
                html = $.parseTmpl( this.tpl, utils.extend( {
                    'container': 'hyperlink'
                }, lang ) );
            }
            this.root().html( html );
        },
        initEvent: function ( km, $w ) {
            $w.find( '#hyperlink_insert' ).on( 'click', function () {
                km.execCommand( 'hyperlink', $w.find( '#hyperlink_href' ).val() );
                $w.kmui().hide();
            } );
            $w.find( '#hyperlink_href' ).on( 'keydown', function ( e ) {
                if ( e.keyCode === 13 ) {
                    km.execCommand( 'hyperlink', $w.find( '#hyperlink_href' ).val() );
                    $w.kmui().hide();
                }
            } );
            var url = km.queryCommandValue( 'hyperlink' );
            var $input = $w.find( '#hyperlink_href' );
            $input.val( url || 'http://' );
            setTimeout( function () {
                $input.focus()
            } )
        },
        width: 400
    } );
} )( KM.Utils );