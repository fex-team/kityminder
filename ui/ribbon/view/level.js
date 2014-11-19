/**
 * @fileOverview
 *
 * 切换展开层次
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('ribbon/view/level', function(minder) {

    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');

    var $levelPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.level'),
        column: true
    }).appendTo($tabs.view);

    var $levelButtonMenu = new FUI.ButtonMenu({
        id: 'level-button-menu',
        text: minder.getLang('ui.level'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.expandtoleaf')
        }],
        menu: {
            items: [1, 2, 3, 4, 5, 6].map(function(level) {
                return {
                    label: minder.getLang('ui.command.expandtolevel' + level),
                    value: level
                };
            })
        }
    }).appendTo($levelPanel);

    $levelButtonMenu.on('buttonclick', function() {
        minder.execCommand('expandtolevel', 9999);
    });

    $levelButtonMenu.on('select', function(e, info) {
        minder.execCommand('expandtolevel', info.value);
    });
});
