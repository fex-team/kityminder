/**
 * @fileOverview
 *
 * 分享按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('topbar/share', function (minder) {
    var $quickvisit = minder.getUI('topbar/quickvisit');

    var $share = $quickvisit.add('share', 'right');

    function quickShare() {
        var $menu = minder.getUI('menu/menu');
        $menu.$tabs.select(3);
        $menu.show();
    }

    $share.click(quickShare);
    minder.addShortcut('ctrl+alt+s', quickShare);
    return $share;
});