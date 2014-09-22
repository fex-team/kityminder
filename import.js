/**
 * 开发版本的文件导入
 */
(function() {
    /* 可能的文件路径，已按照依赖关系排序 */
    var pathInfo = [

        /* 依赖库 */
        { path: 'lib/jquery-2.1.1.js',                  pack: '*' },
        { path: 'lib/jquery.xml2json.js',               pack: '*' },
        { path: 'lib/jquery.transit.min.js',            pack: '*' },
        { path: 'lib/jquery.blob.js',                   pack: 'edit' },
        { path: 'lib/zip.js',                           pack: 'edit' },
        { path: 'lib/promise-1.0.0.js',                 pack: 'edit' },
        { path: 'lib/ZeroClipboard.min.js',             pack: 'edit' },
        { path: 'lib/fui/dev-lib/jhtmls.min.js',        pack: '*' },
        { path: 'lib/fui/dist/fui.all.js',              pack: '*' },
        { path: 'lib/fio/src/fio.js',                   pack: 'edit' },
        { path: 'lib/fio/provider/netdisk/oauth.js',    pack: 'edit' },
        { path: 'lib/fio/provider/netdisk/netdisk.js',  pack: 'edit' },

        /* Kity 依赖库 */
        { path: 'lib/kity/dist/kity.js',                pack: '*' },

        /* 核心代码 */
        { path: 'src/core/kityminder.js',               pack: '*' },
        { path: 'src/core/utils.js',                    pack: '*' },
        { path: 'src/core/browser.js',                  pack: '*' },
        { path: 'src/core/minder.js',                   pack: '*' },

        { path: 'src/core/command.js',                  pack: '*' },
        { path: 'src/core/node.js',                     pack: '*' },

        { path: 'src/core/option.js',                   pack: '*' },
        { path: 'src/core/event.js',                    pack: '*' },
        { path: 'src/core/status.js',                   pack: '*' },
        { path: 'src/core/paper.js',                    pack: '*' },
        { path: 'src/core/select.js',                   pack: '*' },
        { path: 'src/core/key.js',                      pack: '*' },
        { path: 'src/core/contextmenu.js',              pack: '*' },
        { path: 'src/core/module.js',                   pack: '*' },
        { path: 'src/core/data.js',                     pack: '*' },
        { path: 'src/core/readonly.js',                 pack: '*' },
        { path: 'src/core/layout.js',                   pack: '*' },
        { path: 'src/core/theme.js',                    pack: '*' },
        
        { path: 'src/core/compatibility.js',            pack: '*' },
        { path: 'src/core/render.js',                   pack: '*' },
        { path: 'src/core/connect.js',                  pack: '*' },
        { path: 'src/core/template.js',                 pack: '*' },
        { path: 'src/core/lang.js',                     pack: '*' },
        { path: 'src/core/defaultoptions.js',           pack: '*' },
        { path: 'src/core/preference.js',               pack: '*' },
        { path: 'src/core/keymap.js',                   pack: '*' },

        /* 布局 */
        { path: 'src/layout/mind.js',                   pack: '*' },
        { path: 'src/layout/filetree.js',               pack: '*' },
        { path: 'src/layout/btree.js',                  pack: '*' },

        /* 连线 */
        { path: 'src/connect/bezier.js',                pack: '*' },
        { path: 'src/connect/poly.js',                  pack: '*' },
        { path: 'src/connect/arc.js',                   pack: '*' },
        { path: 'src/connect/under.js',                 pack: '*' },
        { path: 'src/connect/l.js',                     pack: '*' },

        /* 皮肤 */
        { path: 'src/theme/default.js',                 pack: '*' },
        { path: 'src/theme/snow.js',                    pack: '*' },
        { path: 'src/theme/fresh.js',                   pack: '*' },

        /* 模板 */
        { path: 'src/template/default.js',              pack: '*' },
        { path: 'src/template/structure.js',            pack: '*' },
        { path: 'src/template/filetree.js',             pack: '*' },
        { path: 'src/template/right.js',                pack: '*' },

        /* 模块 */
        { path: 'src/module/node.js',                   pack: '*' },
        { path: 'src/module/text.js',                   pack: '*' },
        { path: 'src/module/expand.js',                 pack: '*' },
        { path: 'src/module/outline.js',                pack: '*' },
        { path: 'src/module/geometry.js',               pack: '*' },
        { path: 'src/module/history.js',                pack: '*' },
        { path: 'src/module/progress.js',               pack: '*' },
        { path: 'src/module/priority.js',               pack: '*' },
        { path: 'src/module/image.js',                  pack: '*' },
        { path: 'src/module/resource.js',               pack: '*' },
        { path: 'src/module/view.js',                   pack: '*' },
        { path: 'src/module/dragtree.js',               pack: '*' },
        { path: 'src/module/keynav.js',                 pack: '*' },
        { path: 'src/module/select.js',                 pack: '*' },
        { path: 'src/module/history.js',                pack: 'edit' },
        { path: 'src/module/editor.js',                 pack: 'edit' },
        { path: 'src/module/editor.keyboard.js',        pack: 'edit' },
        { path: 'src/module/editor.range.js',           pack: 'edit' },
        { path: 'src/module/editor.receiver.js',        pack: 'edit' },
        { path: 'src/module/editor.selection.js',       pack: 'edit' },
        { path: 'src/module/basestyle.js',              pack: '*' },
        { path: 'src/module/font.js',                   pack: '*' },
        { path: 'src/module/zoom.js',                   pack: '*' },
        { path: 'src/module/hyperlink.js',              pack: '*' },
        { path: 'src/module/arrange.js',                pack: 'edit' },
        { path: 'src/module/paste.js',                  pack: 'edit' },
        { path: 'src/module/style.js',                  pack: 'edit' },

        /* 格式支持 */
        { path: 'src/protocol/xmind.js',                pack: 'edit' },
        { path: 'src/protocol/freemind.js',             pack: 'edit' },
        { path: 'src/protocol/mindmanager.js',          pack: 'edit' },
        { path: 'src/protocol/plain.js',                pack: '*' },
        { path: 'src/protocol/json.js',                 pack: '*' },
        { path: 'src/protocol/png.js',                  pack: '*' },
        { path: 'src/protocol/svg.js',                  pack: '*' },

        /* UI 基础 */
        { path: 'ui/ui.js',                             pack: '*' },
        { path: 'ui/eve.js',                            pack: '*' },
        { path: 'ui/memory.js',                         pack: '*' },
        { path: 'ui/fuix.js',                           pack: '*' },
        { path: 'ui/fiox.js',                           pack: 'edit' },
        { path: 'ui/doc.js',                            pack: '*' },
        { path: 'ui/contextmenu.js',                    pack: 'edit' },

        /* UI 组件 */
        { path: 'ui/widget/commandbutton.js',           pack: 'edit|share' },
        { path: 'ui/widget/commandbuttonset.js',        pack: 'edit' },
        { path: 'ui/widget/commandinputmenu.js',        pack: 'edit' },
        { path: 'ui/widget/commandselectmenu.js',       pack: 'edit' },
        { path: 'ui/widget/friendlytimespan.js',        pack: 'edit' },
        { path: 'ui/widget/locallist.js',               pack: 'edit' },
        { path: 'ui/widget/netdiskfinder.js',           pack: 'edit' },
        { path: 'ui/widget/menutab.js',                 pack: '*' },

        /* 视野导航 */
        { path: 'ui/nav.js',                            pack: '*' },

        /* UI 菜单 */
        { path: 'ui/menu/menu.js',                      pack: '*' },
        { path: 'ui/menu/header.js',                    pack: '*' },
        { path: 'ui/menu/default.js',                   pack: 'edit' },

        /* UI 菜单 - 新建 */
        { path: 'ui/menu/new/new.js',                   pack: 'edit' },

        /* UI 菜单 - 打开 */
        { path: 'ui/menu/open/open.js',                 pack: 'edit' },
        { path: 'ui/menu/open/recent.js',               pack: 'edit' },
        { path: 'ui/menu/open/netdisk.js',              pack: 'edit' },
        { path: 'ui/menu/open/local.js',                pack: 'edit' },
        { path: 'ui/menu/open/draft.js',                pack: 'edit' },

        /* UI 菜单 - 保存 */
        { path: 'ui/menu/save/save.js',                 pack: '*' },
        { path: 'ui/menu/save/netdisk.js',              pack: 'edit' },
        { path: 'ui/menu/save/download.js',             pack: '*' },

        /* UI 菜单 - 分享 */
        { path: 'ui/menu/share/share.js',               pack: 'edit' },
        { path: 'ui/menu/share/view.js',                pack: 'share' },
        { path: 'ui/menu/share/m-share.js',             pack: 'm-share' },

        /* UI Top Bar */
        { path: 'ui/topbar/quickvisit.js',              pack: 'edit' },
        { path: 'ui/topbar/history.js',                 pack: 'edit' },
        { path: 'ui/topbar/user.js',                    pack: 'edit' },
        { path: 'ui/topbar/search.js',                  pack: '*' },
        { path: 'ui/topbar/title.js',                   pack: '*' },
        { path: 'ui/topbar/switch-view.js',             pack: 'm-share' },
        { path: 'ui/topbar/m-logo.js',                  pack: 'm-share' },

        /* UI Ribbon */
        { path: 'ui/ribbon/tabs.js',                    pack: 'edit' },

        /* UI Ribbon「思路」面板 */
        { path: 'ui/ribbon/idea/insert.js',             pack: 'edit' },
        { path: 'ui/ribbon/idea/arrange.js',            pack: 'edit' },
        { path: 'ui/ribbon/idea/operation.js',          pack: 'edit' },
        { path: 'ui/ribbon/idea/attachment.js',         pack: 'edit' },
        { path: 'ui/ribbon/idea/link.js',               pack: 'edit' },
        { path: 'ui/ribbon/idea/image.js',              pack: 'edit' },
        { path: 'ui/ribbon/idea/priority.js',           pack: 'edit' },
        { path: 'ui/ribbon/idea/progress.js',           pack: 'edit' },
        { path: 'ui/ribbon/idea/resource.js',           pack: 'edit' },

        /* UI Ribbon「展示」面板 */
        { path: 'ui/ribbon/appearence/template.js',     pack: 'edit' },
        { path: 'ui/ribbon/appearence/theme.js',        pack: 'edit' },
        { path: 'ui/ribbon/appearence/layout.js',       pack: 'edit' },
        { path: 'ui/ribbon/appearence/style.js',        pack: 'edit' },
        { path: 'ui/ribbon/appearence/font.js',         pack: 'edit' },
        { path: 'ui/ribbon/appearence/color.js',        pack: 'edit' },

        /* UI Ribbon「视图」面板 */
        { path: 'ui/ribbon/view/level.js',              pack: 'edit' }
    ];

    if (typeof(module) === 'object' && module.exports) {
        module.exports = pathInfo;
    } 

    else if (document) {
        /* jshint browser:true */
        var src = document.currentScript.src;
        var pack = /pack=(\w+)(?:&|$)/.exec(src);
        if (!pack) return;
        pack = pack[1];
        while (pathInfo.length) {
            var info = pathInfo.shift();
            if (info.pack == '*' || info.pack.split('|').indexOf(pack) != -1) {
                window.document.write('<script type="text/javascript" src="' + info.path + '"></script>');
            }
        }
    }
})();