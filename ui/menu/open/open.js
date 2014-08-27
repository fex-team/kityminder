/**
 * @fileOverview
 *
 * 打开菜单（二级菜单）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/open', function(minder) {

    var $level1 = minder.getUI('menu/level1');
    var eve = minder.getUI('eve');

    var $h2 = $('<h2></h2>')
        .text(minder.getLang('ui.menu.open.header'))
        .appendTo($level1.open.getContentElement());

    var source = ['recent', 'netdisk', 'local', 'draft'];

    var $tabs = new FUI.Tabs({
        buttons: source.map(function(key) {
            return {
                label: minder.getLang('ui.menu.open.' + key),
                className: key
            };
        })
    }).appendTo($level1.open);


    // 暴露
    var ret = {};

    // 暴露每个面板
    source.forEach(function(key, index) {
        ret[key] = $tabs.getPanel(index);
    });

    // 支持事件
    eve.setup(ret);

    // 暴露打开菜单（选项卡）选择事件
    $tabs.on('tabsselect', function(e, info) {
        ret.fire('select', info);
    });

    // 暴露选择事件
    ret.select = $tabs.select.bind($tabs);

    return ret;
});