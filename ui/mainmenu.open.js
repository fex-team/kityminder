KityMinder.registerUI('mainmenu.open', ['mainmenu.level1', 'eve'], function(minder, $level1, eve) {

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

    var ret = {};

    source.forEach(function(key, index) {
        ret[key] = $tabs.getPanel(index);
    });
    
    eve.setup(ret);
    
    $tabs.on('tabsselect', function(e, info) {
        ret.fire('select', info);
    });

    ret.select = $tabs.select.bind($tabs);

    return ret;
});