KityMinder.registerUI('mainmenu.level1', ['mainmenu'], function (minder, $mainmenu) {
    var tabs = ['open', 'save', 'share', 'help'];

    var $l1_tabs = new FUI.Tabs({
        buttons: tabs.map(function(key) {
            return minder.getLang('ui.menu.level1.' + key);
        }),
        className: 'main-menu-level-1'
    });

    $l1_tabs.appendTo($mainmenu[0]);

    $l1_tabs.select(0);

    var ret = {};

    tabs.forEach(function(key, index) {
        ret[key] = $l1_tabs.getPanel(index);
    });

    return ret;
});