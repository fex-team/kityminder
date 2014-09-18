/**
 * @fileOverview
 *
 * 菜单默认选择项目
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/default', function (minder) {

    minder.on('uiready', function() {

        var $menu = minder.getUI('menu/menu');
        var $open = minder.getUI('menu/open/open');
        var $save = minder.getUI('menu/save/save');
        var $share = minder.getUI('menu/share/share');
        var $draft = minder.getUI('menu/open/draft');

        $menu.$tabs.select(1); // 打开
        $open.$tabs.select(0); // 最近
        $save.$tabs.select(0); // 云存储
        $share.$tabs.select(0); // 当前脑图
        
        if ($draft.hasDraft()) {
            $draft.openLast();
        }
        // $menu.show();
    });
});