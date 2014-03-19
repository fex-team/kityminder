( function () {
    var helpContent = '<div class="help-content" style="padding:10px;width:380px;">';

    helpContent += '<h2>基本操作</h2>';
    helpContent += '<p>编辑脑图的时候，最基本的操作是插入节点、编辑节点、删除节点、设置节点样式</p>';
    helpContent += '<ul>';
    helpContent += '    <li>插入子节点：在选中的节点中按 Tab 键</li>';
    helpContent += '    <li>插入同级节点：在选中的节点中按 Enter/Return 键</li>';
    helpContent += '    <li>编辑节点：刚插入的子节点和同级节点会进入编辑模式；其他节点双击也能进入编辑模式；编辑模式下可以编辑节点的文本</li>';
    helpContent += '    <li>设置节点样式：你可以选中一个或多个节点后，在工具栏中改变选中节点的样式。也可以使用快捷键来使用这些功能：撤销（Ctrl+Z）、重做（Ctrl+Y）、加粗（Ctrl+B）、斜体（Ctrl+I）</li>';
    helpContent += '</ul>';

    helpContent += '<h2>导入导出</h2>';
    helpContent += '<p>您可以导出你的脑图到本地，方法是点击工具栏上的导出按钮，然后选择要导出的格式。下面列出支持的格式列表：</p>';
    helpContent += '<ul>';
    helpContent += '    <li>大纲文本：导出成以制表符界定大纲的文本，此格式可以被导入</li>';
    helpContent += '    <li>KityMinder格式：KityMinder自身的保存格式（JSON），此格式可以被导入</li>';
    helpContent += '    <li>PNG 图片：导出成 PNG 位图格式，此格式不可被导入</li>';
    helpContent += '    <li>SVG 矢量图：导出成 SVG 矢量图格式，可以被矢量工具二次加工，此格式不可被导入</li>';
    helpContent += '</ul>';

    helpContent += '<p>导出的文件可以直接拖放到 KityMinder 上直接打开</p>';

    helpContent += '<h2>云盘功能</h2>';
    helpContent += '<p>使用百度账号登录后，您可以使用云存储和分享功能</p>';
    helpContent += '<ul>';
    helpContent += '    <li>登录：点击登录按钮</li>';
    helpContent += '    <li>保存：点击保存按钮，将会把文件保存到你的云盘里</li>';
    helpContent += '    <li>分享：点击分享按钮，会生成分享链接，该链接可以打开您分享的脑图</li>';
    helpContent += '    <li>打开：点击您账号的下拉按钮，会列出最近保存的脑图文件，点击即可打开</li>';
    helpContent += '</ul>';

    helpContent += '<h2>视野导航</h2>';
    helpContent += '<p>视野导航包括以下几个功能：</p>';
    helpContent += '<ul>';
    helpContent += '    <li>视野拖动：根节点未被选中的情况下，拖动根节点可以拖动视野；或者使用空格键切换拖动状态</li>';
    helpContent += '    <li>视野缩放：点击工具栏中的“放大”和“缩小”按钮可以缩放视野，或者按着 Ctrl 键使用滚轮缩放</li>';
    helpContent += '    <li>视野复位：双击空白处，可以将视野复位</li>';
    helpContent += '</ul>';

    helpContent += '</div>';

    var utils = KM.utils;
    KM.registerWidget( 'help', {
        tpl: helpContent,
        initContent: function ( km ) {
            var lang = km.getLang( 'dialogs.markers' ),
                html;
            if ( lang ) {
                html = $.parseTmpl( this.tpl, lang );
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
        width: 400
    } );
} )();