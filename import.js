

/**
 * 开发版本的文件导入
 */
(function() {
    /* 可能的文件路径，已按照依赖关系排序 */
    var pathInfo = [

        /* 依赖库 */
        { path: 'lib/jquery-2.1.1.js',                  pack: '*' },
        { path: 'lib/promise-1.0.0.js',                 pack: '*' },
        { path: 'lib/jquery.xml2json.js',               pack: 'edit|share|m-share' },
        { path: 'lib/jquery.transit.min.js',            pack: 'edit|share|m-share' },
        { path: 'lib/jquery.blob.js',                   pack: 'edit' },
        { path: 'lib/zip.js',                           pack: 'edit' },
        { path: 'lib/ZeroClipboard.min.js',             pack: 'edit' },
        { path: 'lib/qrcode.js',                        pack: 'edit' },
        { path: 'lib/fui/dev-lib/jhtmls.min.js',        pack: 'edit|share|m-share' },
        { path: 'lib/fui/dist/fui.all.js',              pack: 'edit|share|m-share' },
        { path: 'lib/fio/src/fio.js',                   pack: 'index|edit' },
        { path: 'lib/fio/provider/netdisk/oauth.js',    pack: 'index|edit' },
        { path: 'lib/fio/provider/netdisk/netdisk.js',  pack: 'edit' },

        /* Kity 依赖库 */
        { path: 'lib/kity/dist/kity.js',                pack: 'edit|share|m-share' },

        /* 核心代码 */
        { path: 'src/core/kityminder.js',               pack: 'edit|share|m-share' },
        { path: 'src/core/utils.js',                    pack: 'edit|share|m-share' },
        { path: 'src/core/browser.js',                  pack: 'edit|share|m-share' },
        { path: 'src/core/minder.js',                   pack: 'edit|share|m-share' },

        { path: 'src/core/command.js',                  pack: 'edit|share|m-share' },
        { path: 'src/core/node.js',                     pack: 'edit|share|m-share' },

        { path: 'src/core/option.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/event.js',                    pack: 'edit|share|m-share' },
        { path: 'src/core/status.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/paper.js',                    pack: 'edit|share|m-share' },
        { path: 'src/core/select.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/key.js',                      pack: 'edit|share|m-share' },
        { path: 'src/core/contextmenu.js',              pack: 'edit|share|m-share' },
        { path: 'src/core/module.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/data.js',                     pack: 'edit|share|m-share' },
        { path: 'src/core/readonly.js',                 pack: 'edit|share|m-share' },
        { path: 'src/core/layout.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/theme.js',                    pack: 'edit|share|m-share' },
        
        { path: 'src/core/compatibility.js',            pack: 'edit|share|m-share' },
        { path: 'src/core/render.js',                   pack: 'edit|share|m-share' },
        { path: 'src/core/connect.js',                  pack: 'edit|share|m-share' },
        { path: 'src/core/template.js',                 pack: 'edit|share|m-share' },
        { path: 'src/core/lang.js',                     pack: 'edit|share|m-share' },
        { path: 'src/core/defaultoptions.js',           pack: 'edit|share|m-share' },
        { path: 'src/core/preference.js',               pack: 'edit|share|m-share' },
        { path: 'src/core/keymap.js',                   pack: 'edit|share|m-share' },

        /* 布局 */
        { path: 'src/layout/mind.js',                   pack: 'edit|share|m-share' },
        { path: 'src/layout/filetree.js',               pack: 'edit|share|m-share' },
        { path: 'src/layout/btree.js',                  pack: 'edit|share|m-share' },

        /* 连线 */
        { path: 'src/connect/bezier.js',                pack: 'edit|share|m-share' },
        { path: 'src/connect/poly.js',                  pack: 'edit|share|m-share' },
        { path: 'src/connect/arc.js',                   pack: 'edit|share|m-share' },
        { path: 'src/connect/under.js',                 pack: 'edit|share|m-share' },
        { path: 'src/connect/l.js',                     pack: 'edit|share|m-share' },

        /* 皮肤 */
        { path: 'src/theme/default.js',                 pack: 'edit|share|m-share' },
        { path: 'src/theme/snow.js',                    pack: 'edit|share|m-share' },
        { path: 'src/theme/fresh.js',                   pack: 'edit|share|m-share' },

        /* 模板 */
        { path: 'src/template/default.js',              pack: 'edit|share|m-share' },
        { path: 'src/template/structure.js',            pack: 'edit|share|m-share' },
        { path: 'src/template/filetree.js',             pack: 'edit|share|m-share' },
        { path: 'src/template/right.js',                pack: 'edit|share|m-share' },

        /* 模块 */
        { path: 'src/module/node.js',                   pack: 'edit|share|m-share' },
        { path: 'src/module/text.js',                   pack: 'edit|share|m-share' },
        { path: 'src/module/expand.js',                 pack: 'edit|share|m-share' },
        { path: 'src/module/outline.js',                pack: 'edit|share|m-share' },
        { path: 'src/module/geometry.js',               pack: 'edit|share|m-share' },
        { path: 'src/module/history.js',                pack: 'edit|share|m-share' },
        { path: 'src/module/progress.js',               pack: 'edit|share|m-share' },
        { path: 'src/module/priority.js',               pack: 'edit|share|m-share' },
        { path: 'src/module/image.js',                  pack: 'edit|share|m-share' },
        { path: 'src/module/resource.js',               pack: 'edit|share|m-share' },
        { path: 'src/module/view.js',                   pack: 'edit|share|m-share' },
        { path: 'src/module/dragtree.js',               pack: 'edit|share|m-share' },
        { path: 'src/module/keynav.js',                 pack: 'edit|share|m-share' },
        { path: 'src/module/select.js',                 pack: 'edit|share|m-share' },
        { path: 'src/module/history.js',                pack: 'edit' },
        { path: 'src/module/editor.js',                 pack: 'edit' },
        { path: 'src/module/editor.keyboard.js',        pack: 'edit' },
        { path: 'src/module/editor.range.js',           pack: 'edit' },
        { path: 'src/module/editor.receiver.js',        pack: 'edit' },
        { path: 'src/module/editor.selection.js',       pack: 'edit' },
        { path: 'src/module/basestyle.js',              pack: 'edit|share|m-share' },
        { path: 'src/module/font.js',                   pack: 'edit|share|m-share' },
        { path: 'src/module/zoom.js',                   pack: 'edit|share|m-share' },
        { path: 'src/module/hyperlink.js',              pack: 'edit|share|m-share' },
        { path: 'src/module/arrange.js',                pack: 'edit' },
        { path: 'src/module/clipboard.js',              pack: 'edit' },
        { path: 'src/module/style.js',                  pack: 'edit' },

        /* 格式支持 */
        { path: 'src/protocol/xmind.js',                pack: 'edit' },
        { path: 'src/protocol/freemind.js',             pack: 'edit' },
        { path: 'src/protocol/mindmanager.js',          pack: 'edit' },
        { path: 'src/protocol/plain.js',                pack: 'edit|share|m-share' },
        { path: 'src/protocol/json.js',                 pack: 'edit|share|m-share' },
        { path: 'src/protocol/png.js',                  pack: 'edit|share|m-share' },
        { path: 'src/protocol/svg.js',                  pack: 'edit|share|m-share' },

        /* UI 基础 */
        { path: 'ui/ui.js',                             pack: 'edit|share|m-share' },
        { path: 'ui/eve.js',                            pack: 'edit|share|m-share' },
        { path: 'ui/memory.js',                         pack: 'edit|share|m-share' },
        { path: 'ui/fuix.js',                           pack: 'edit|share|m-share' },
        { path: 'ui/fiox.js',                           pack: 'edit' },

        /* UI 组件 */
        { path: 'ui/widget/commandbutton.js',           pack: 'edit|share' },
        { path: 'ui/widget/commandbuttonset.js',        pack: 'edit' },
        { path: 'ui/widget/commandinputmenu.js',        pack: 'edit' },
        { path: 'ui/widget/commandselectmenu.js',       pack: 'edit' },
        { path: 'ui/widget/friendlytimespan.js',        pack: 'edit' },
        { path: 'ui/widget/locallist.js',               pack: 'edit' },
        { path: 'ui/widget/netdiskfinder.js',           pack: 'edit' },
        { path: 'ui/widget/menutab.js',                 pack: 'edit|share|m-share' },
        { path: 'ui/widget/notice.js',                  pack: 'edit|share|m-share' },

        /* 基本业务 */
        { path: 'ui/doc.js',                            pack: 'edit|share|m-share' },
        { path: 'ui/contextmenu.js',                    pack: 'edit|share' },

        /* 视野导航 */
        { path: 'ui/nav.js',                            pack: 'edit|share' },

        /* UI 菜单 */
        { path: 'ui/menu/menu.js',                      pack: 'edit|share' },
        { path: 'ui/menu/header.js',                    pack: 'edit|share' },
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
        { path: 'ui/menu/save/save.js',                 pack: 'edit|share' },
        { path: 'ui/menu/save/netdisk.js',              pack: 'edit' },
        { path: 'ui/menu/save/download.js',             pack: 'edit|share' },

        /* UI 菜单 - 分享 */
        { path: 'ui/menu/share/share.js',               pack: 'edit' },
        { path: 'ui/menu/share/view.js',                pack: 'share' },
        { path: 'ui/menu/share/m-share.js',             pack: 'm-share' },

        /* UI 菜单 - 帮助 */
        { path: 'ui/menu/help/help.js',                 pack: 'edit|share'},
        { path: 'ui/menu/help/feedback.js',             pack: 'edit|share'},

        /* UI Top Bar */
        { path: 'ui/topbar/quickvisit.js',              pack: 'edit|share' },
        { path: 'ui/topbar/history.js',                 pack: 'edit' },
        { path: 'ui/topbar/user.js',                    pack: 'edit' },
        { path: 'ui/topbar/feedback.js',                pack: 'edit|share' },
        { path: 'ui/topbar/search.js',                  pack: 'edit|share' },
        { path: 'ui/topbar/switch-view.js',             pack: 'm-share' },
        { path: 'ui/topbar/m-logo.js',                  pack: 'm-share' },
        { path: 'ui/topbar/title.js',                   pack: 'edit|share|m-share' },

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
        { path: 'ui/ribbon/view/fullscreen.js',         pack: 'edit' },
        { path: 'ui/ribbon/view/level.js',              pack: 'edit' }
    ];

    if (typeof(module) === 'object' && module.exports) {
        module.exports = pathInfo;
    } 

    else if (document) {

        // currentScript polyfill
        if("undefined" === typeof document.currentScript){
            (function(){
                /***************************************************************************/
                /* document.currentScript polyfill + improvements */
                /***************************************************************************/
                var scripts = document.getElementsByTagName('script');
                document._currentScript = document.currentScript;
         
                // return script object based off of src
                var getScriptFromURL = function(url) {
                    for (var i = 0; i < scripts.length; i++)
                        if (scripts[i].src === url)
                            return scripts[i];
         
                    return undefined;
                };
         
                var actualScript = document.actualScript = function() {
                    if (document._currentScript)
                        return document._currentScript;
         
                    var stack;
                    try {
                        window.omgwtf();
                    } catch(e) {
                        stack = e.stack;
                    }
         
                    if (!stack)
                        return undefined;
         
                    var e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
                    while (stack.indexOf(e) !== -1)
                        stack = stack.substring(stack.indexOf(e) + e.length);

                    stack = stack.substring(stack.indexOf('http'), stack.indexOf(':', stack.indexOf(':')+1));
         
                    return getScriptFromURL(stack);
                };
                if (document.__defineGetter__)
                    document.__defineGetter__('currentScript', actualScript);
         
            })();
         
         
        }
        /* jshint browser:true */
        var script = document.currentScript || document.actualScript();
        var src = script.src;
        var pack = /pack=([\w-]+)(?:&|$)/.exec(src);
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