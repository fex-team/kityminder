function fontUI(minder, $tabs, $commandInputMenu, $commandButton) {

    var $fontPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.font'),
        id: 'font-panel'
    });

    var $leftPanel = new FUI.Panel({
        column: true
    });

    var $rightPanel = new FUI.Panel({
        column: true
    });

    var $fontFamilyMenu = $commandInputMenu.generate('fontfamily', minder.getOptions('fontfamily').map(function(ff) {
        return {
            label: {
                text: ff.name,
                style: {
                    fontFamily: ff.val
                }
            },
            text: ff.name,
            value: ff.val
        };
    }));

    var $fontSizeMenu = $commandInputMenu.generate('fontsize', minder.getOptions('fontsize').map(function(fs) {
        return {
            label: {
                text: fs,
                style: {
                    fontSize: fs
                }
            },
            text: fs,
            value: fs
        };
    }));

    $leftPanel.appendWidgets([$fontFamilyMenu, $fontSizeMenu]);

    var $boldButton = $commandButton.generate('bold');
    var $italicButton = $commandButton.generate('italic');

    $rightPanel.appendWidgets([$boldButton, $italicButton]);

    $fontPanel.appendWidgets([$leftPanel, $rightPanel]);

    $tabs.edit.appendWidget($fontPanel);
}

KityMinder.registerUI('font', ['tabs', 'commandinputmenu', 'commandbutton'], fontUI);