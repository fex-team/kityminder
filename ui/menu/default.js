/**
 * @fileOverview
 *
 * 菜单默认选择项目
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/default', function(minder) {

    minder.on('uiready', function() {

        var $menu = minder.getUI('menu/menu');
        var $open = minder.getUI('menu/open/open');
        var $recent = minder.getUI('menu/open/recent');
        var $save = minder.getUI('menu/save/save');
        var $share = minder.getUI('menu/share/share');
        var $draft = minder.getUI('menu/open/draft');

        setMenuDefaults();
        loadLandingFile();
        // $menu.show();
        // $menu.$tabs.select(5);

        function setMenuDefaults() {

            // 主菜单默认选中「打开」
            $menu.$tabs.select(1);

            // 打开菜单默认选中「本地文件」
            $open.$tabs.select(2);

            // 保存菜单默认选中「导出到本地」
            $save.$tabs.select(1);

            // 如果用户登陆了，选中「百度云存储」
            fio.user.check().then(function(user) {
                if (user) {
                    $save.$tabs.select(0);
                }
            });

            $share.$menu.$tabs.select(0); // 当前脑图
        }

        function loadLandingFile() {
            var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
            var match = pattern.exec(window.location) || pattern.exec(document.referrer);

            if (match) {
                $share.loadShareFile();
            }
            else if ($draft.hasDraft()) {
                // 草稿箱有草稿，默认选中「草稿箱」，并打开最近编辑的文件
                $open.$tabs.select(3);
                $draft.openLast();
            } else {
                // 没有草稿，但用户登陆了
                fio.user.check().then(function(user) {
                    if (user) {
                        // 有最近文件选中「最近文件」
                        if ($recent.hasRecent()) {
                            $open.$tabs.select(0);
                            $recent.loadLast();
                        }
                        // 否则选中网盘目录
                        else {
                            $open.$tabs.select(1);
                        }
                    }
                });
            }
        }
    });
});