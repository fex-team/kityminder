KityMinder.registerUI('theme', ['tabs'], function(minder, $tabs) {

    var buttonset = minder.getUI('commandbuttonset');

    var $themePanel = new FUI.LabelPanel({
        id: 'theme-panel',
        label: minder.getLang('panels.theme')
    });

    var $themeSelect = new FUI.DropPanel({
        id: 'theme-select'
    });

    $tabs.edit.appendWidget($themePanel);
    $themePanel.appendWidget($themeSelect);

    var themeList = KityMinder.Utils.keys(KityMinder.getThemeList());

    $themeSelect.appendWidget(buttonset.generate('theme', themeList.map(function(theme) {
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