( function () {
    //todo 这里先写死成中文
    var preferenceContent = '<div class="help-content" style="padding:20px;width:360px;">';
    preferenceContent += '<h3>展开属性设置</h3>';
    preferenceContent += '<p><label><input type="checkbox" name="expand" />打开时展开全部节点（刷新页面生效）</label></p>';
    preferenceContent += '<p><hr/></p>';
    preferenceContent += '<p><button id="reset_preference">重置</button></p>';
    //preferenceContent += '<p><label><b style="color:red">有些偏好设置会在你下次刷新页面时生效</b></label></p>';
    preferenceContent += '</div>';


    //todo 偏好设置暂时都在这里处理
    //用于在reset所有偏好时，清除这个dialog下的所有偏好
    var allPreferences = {};

    function checkEverything( km, $w ) {
        checkExpand( km, $w )
    }

    function initEverything( km, $w ) {
        initExpand( km, $w )
    }

    //展开
    function initExpand( km, $w ) {
        var expand = km.getOptions( 'defaultExpand' );
        $w.find( '[name=expand]' )[ 0 ].checked = expand && expand.defaultLayer == 0;
        allPreferences[ 'defaultExpand' ] = null;
    }

    function checkExpand( km, $w ) {
        var checked = $w.find( '[name=expand]' )[ 0 ].checked;
        if ( checked ) {
            km.setPreferences( 'defaultExpand', {
                'defaultLayer': 0,
                'defaultSubShow': 0
            } )
        } else {
            km.setPreferences( 'defaultExpand' )
        }
    }

    //重置偏好
    function resetPreferences( km ) {
        km.setPreferences( allPreferences )
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
            //绑定默认值
            initEverything( km, $w );
            $w.find( '#reset_preference' ).on( 'click', function ( e ) {
                resetPreferences( km );
                //重置系统默认的偏好设置
                initEverything( km, $w )
            } );
            $w.on( 'click', '.kmui-close', function ( e ) {
                checkEverything( km, $w );
                km.fire( 'preferencechange' )
            } );
        },
        width: 400
    } );
} )();