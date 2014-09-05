/**
 * @fileOverview
 *
 * 皮肤选择
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/theme', function(minder) {

    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $tabs = minder.getUI('ribbon/tabs');

    var $themePanel = new FUI.LabelPanel({
        id: 'theme-panel',
        label: minder.getLang('panels.theme')
    });

    var $themeSelect = new FUI.DropPanel({
        id: 'theme-select'
    });

    $tabs.appearence.appendWidget($themePanel);
    $themePanel.appendWidget($themeSelect);

    var themeList = KityMinder.Utils.keys(KityMinder.getThemeList());

    $themeSelect.appendWidget($commandbuttonset.generate('theme', themeList.map(function(theme) {
        var style = KityMinder._themes[theme];
        return {
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
    })));

    return $themePanel;
});