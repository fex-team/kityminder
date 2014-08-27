/**
 * @fileOverview
 *
 * 保存菜单（二级菜单）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/save/save', function(minder) {

    var $level1 = minder.getUI('menu/level1');
    var eve = minder.getUI('eve');

    var $h2 = $('<h2></h2>')
        .text(minder.getLang('ui.menu.save.header'))
        .appendTo($level1.save.getContentElement());

    var source = ['netdisk', 'local'];

    var $tabs = new FUI.Tabs({
        buttons: source.map(function(key) {
            return {
                label: minder.getLang('ui.menu.save.' + key),
                className: key
            };
        })
    }).appendTo($level1.save);


    // 暴露
    var ret = eve.setup({});

    // 暴露每个面板
    source.forEach(function(key, index) {
        ret[key] = $tabs.getPanel(index);
    });
    
    // 暴露保存菜单（选项卡）选择事件
    $tabs.on('tabsselect', function(e, info) {
        ret.fire('select', info);
    });

    // 暴露选择事件
    ret.select = $tabs.select.bind($tabs);

    return ret;
});