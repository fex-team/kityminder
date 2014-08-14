/**
 * 开发版本的文件导入
 */
(function() {
    var paths = [

        /* Kity 依赖库 */
        'lib/kity/dist/kity.js',

        /* 核心代码 */
        'src/core/kityminder.js',
        'src/core/utils.js',
        'src/core/command.js',
        'src/core/node.js',
        'src/core/module.js',
        'src/core/event.js',
        'src/core/minder.js',
        'src/core/minder.data.compatibility.js',
        'src/core/minder.data.js',
        'src/core/minder.event.js',
        'src/core/minder.module.js',
        'src/core/minder.command.js',
        'src/core/minder.node.js',
        'src/core/minder.select.js',
        'src/core/keymap.js',
        'src/core/minder.lang.js',
        'src/core/minder.defaultoptions.js',
        'src/core/minder.preference.js',
        'src/core/browser.js',
        'src/core/layout.js',
        'src/core/connect.js',
        'src/core/render.js',
        'src/core/theme.js',
        'src/core/template.js',

        /* 布局 */
        'src/layout/default.js',
        'src/layout/default.connect.js',
        'src/layout/bottom.js',
        'src/layout/filetree.js',

        /* 皮肤 */
        'src/theme/default.js',
        'src/theme/snow.js',
        'src/theme/fresh.js',

        /* 模板 */
        'src/template/structure.js',

        /* 模块 */
        'src/module/node.js',
        'src/module/text.js',
        'src/module/expand.js',
        'src/module/outline.js',
        'src/module/geometry.js',
        'src/module/history.js',
        'src/module/progress.js',
        'src/module/priority.js',
        'src/module/image.js',
        'src/module/resource.js',
        'src/module/view.js',
        'src/module/dragtree.js',
        'src/module/dropfile.js',
        'src/module/keyboard.js',
        'src/module/select.js',
        'src/module/history.js',
        'src/module/editor.js',
        'src/module/editor.range.js',
        'src/module/editor.receiver.js',
        'src/module/editor.selection.js',
        'src/module/basestyle.js',
        'src/module/font.js',
        'src/module/zoom.js',
        'src/module/hyperlink.js',
        'src/module/arrange.js',
        'src/module/paste.js',
        'src/module/style.js',

        /* 格式支持 */
        'src/protocal/xmind.js',
        'src/protocal/freemind.js',
        'src/protocal/mindmanager.js',
        'src/protocal/plain.js',
        'src/protocal/json.js',
        'src/protocal/png.js',
        'src/protocal/svg.js',

        /* UI 依赖库 */
        'lib/jquery-2.1.0.min.js',
        'lib/promise-1.0.0.js',
        'lib/ZeroClipboard.min.js',
        'lib/fui/dev-lib/jhtmls.min.js',
        'lib/fui/dist/fui.all.js',
        'lib/fio/dist/fio.js',
        'lib/fio/provider/netdisk/netdisk.js',

        /* 导入依赖 */
        'lib/jquery.xml2json.js',
        'lib/zip.js',

        /* UI 代码 */
        'ui/ui.js',
        'ui/fuix.js',
        'ui/mainmenu.js',
        'ui/commandbutton.js',
        'ui/commandbuttonset.js',
        'ui/commandinputmenu.js',
        'ui/history.js',
        'ui/tabs.js',
        'ui/title.js',
        'ui/account.js',
        'ui/template.js',
        'ui/theme.js',
        'ui/layout.js',
        'ui/style.js',
        'ui/font.js',
        'ui/color.js',
        'ui/insertnode.js',
        'ui/arrange.js',
        'ui/nodeop.js',
        'ui/priority.js',
        'ui/progress.js',
        'ui/resource.js',
        'ui/attachment.js',
        'ui/link.js',
        'ui/image.js'
    ];

    if (typeof(module) === 'object' && module.exports) {
        module.exports = paths;
    } else if (document) {
        while (paths.length) {
            /* jshint browser:true */
            window.document.write('<script type="text/javascript" src="' + paths.shift() + '"></script>');
        }
    }
})();