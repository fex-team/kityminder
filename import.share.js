/**
 * 开发版本的文件导入
 */
(function() {

    /* 可能的文件路径，已按照依赖关系排序 */
    var paths = [

        /* 依赖库 */
        'lib/jquery-2.1.1.js',
        'lib/jquery.transit.min.js',
        'lib/promise-1.0.0.js',
        'lib/fui/dev-lib/jhtmls.min.js',
        'lib/fui/dist/fui.all.js',

        /* Kity 依赖库 */
        'lib/kity/dist/kity.js',

        /* 核心代码 */
        'src/core/kityminder.js',
        'src/core/utils.js',
        'src/core/browser.js',
        'src/core/minder.js',
        'src/core/option.js',
        'src/core/event.js',
        'src/core/status.js',
        'src/core/paper.js',
        'src/core/readonly.js',
        'src/core/command.js',
        'src/core/node.js',
        'src/core/module.js',
        'src/core/data.js',
        'src/core/compatibility.js',
        'src/core/render.js',
        'src/core/connect.js',
        'src/core/theme.js',
        'src/core/layout.js',
        'src/core/template.js',
        'src/core/select.js',
        'src/core/lang.js',
        'src/core/defaultoptions.js',
        'src/core/preference.js',
        'src/core/keymap.js',
        'src/core/key.js',
        'src/core/contextmenu.js',

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
        'src/module/progress.js',
        'src/module/priority.js',
        'src/module/image.js',
        'src/module/resource.js',
        'src/module/view.js',
        'src/module/dragtree.js',
        'src/module/keyboard.js',
        'src/module/select.js',
        'src/module/basestyle.js',
        'src/module/font.js',
        'src/module/zoom.js',
        'src/module/hyperlink.js',
        'src/module/arrange.js',
        'src/module/paste.js',
        'src/module/style.js',

        /* 格式支持 */
        'src/protocol/plain.js',
        'src/protocol/json.js',
        'src/protocol/png.js',
        'src/protocol/svg.js',

        /* UI 基础 */
        'ui/ui.js',
        'ui/eve.js',
        'ui/fuix.js',
        // 'ui/fiox.js',
        'ui/doc.js',

        /* UI 组件 */
        // 'ui/widget/commandbutton.js',
        // 'ui/widget/commandbuttonset.js',
        // 'ui/widget/commandinputmenu.js',
        // 'ui/widget/friendlytimespan.js',
        // 'ui/widget/locallist.js',
        // 'ui/widget/netdiskfinder.js',
        'ui/widget/menutab.js',

        /* UI 菜单 */
        'ui/menu/menu.js',
        'ui/menu/header.js',

        /* UI 菜单 - 新建 */
        // 'ui/menu/new/new.js',

        /* UI 菜单 - 打开 */
        // 'ui/menu/open/open.js',
        // 'ui/menu/open/recent.js',
        // 'ui/menu/open/netdisk.js',
        // 'ui/menu/open/local.js',
        // 'ui/menu/open/draft.js',

        /* UI 菜单 - 保存 */
        'ui/menu/save/save.js',
        // 'ui/menu/save/netdisk.js',
        'ui/menu/save/download.js',

        /* UI 菜单 - 分享 */
        // 'ui/menu/share/share.js',
        'ui/menu/share/view.js',

        /* UI Top Bar */
        // 'ui/topbar/history.js',
        // 'ui/topbar/user.js',
        'ui/topbar/search.js',
        'ui/topbar/title.js',

        /* UI Ribbon */
        // 'ui/ribbon/tabs.js',

        /* UI Ribbon「思路」面板 */
        // 'ui/ribbon/idea/insert.js',
        // 'ui/ribbon/idea/arrange.js',
        // 'ui/ribbon/idea/operation.js',
        // 'ui/ribbon/idea/attachment.js',
        // 'ui/ribbon/idea/link.js',
        // 'ui/ribbon/idea/image.js',
        // 'ui/ribbon/idea/priority.js',
        // 'ui/ribbon/idea/progress.js',
        // 'ui/ribbon/idea/resource.js',

        /* UI Ribbon「展示」面板 */
        // 'ui/ribbon/appearence/template.js',
        // 'ui/ribbon/appearence/theme.js',
        // 'ui/ribbon/appearence/layout.js',
        // 'ui/ribbon/appearence/style.js',
        // 'ui/ribbon/appearence/font.js',
        // 'ui/ribbon/appearence/color.js',

        /* UI Ribbon「视图」面板 */
        // 'ui/ribbon/view/level.js'
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