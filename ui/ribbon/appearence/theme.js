/**
 * @fileOverview
 *
 * 皮肤选择
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/theme', function(minder) {

    var $commandselectmenu = minder.getUI('widget/commandselectmenu');
    var $tabs = minder.getUI('ribbon/tabs');

    var $themePanel = new FUI.LabelPanel({
        id: 'theme-panel',
        label: minder.getLang('panels.theme')
    });

    var themeList = KityMinder.Utils.keys(KityMinder.getThemeList());
    var $themeSelect = $commandselectmenu.generate('theme', themeList.map(function(theme) {
        var style = KityMinder._themes[theme];
        return {
            clazz: 'Button',
            label: {
                text: minder.getLang('theme.' + theme),
                style: {
                    background: style['root-background'],
                    color: style['root-color'],
                    borderRadius: style['root-radius'] / 2
                }
            },
            text: minder.getLang('theme.' + theme),
            value: theme,
            className: ['theme', theme].join(' ')
        };
    }));

    $tabs.appearence.appendWidget($themePanel);
    $themePanel.appendWidget($themeSelect);

    minder.on('themechange', function(e) {
        $('#content-wrapper').css('background', minder.getStyle('background'));
    });

    return $themePanel;
});