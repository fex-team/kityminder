/**
 * @fileOverview
 *
 * 一级菜单
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/level1', function(minder) {

    var $menu = minder.getUI('menu/menu');

    var tabs = ['new', 'open', 'save', 'share', 'help'];

    var $l1_tabs = new FUI.Tabs({
        buttons: tabs.map(function(key) {
            return {
                label: minder.getLang('ui.menu.level1.' + key),
                className: key
            };
        }),
        className: 'main-menu-level-1'
    });

    $l1_tabs.appendTo($menu[0]);

    $l1_tabs.select(2);

    var ret = {};

    tabs.forEach(function(key, index) {
        ret[key] = $l1_tabs.getPanel(index);
    });

    return ret;
});