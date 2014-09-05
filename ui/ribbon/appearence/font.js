/**
 * @fileOverview
 *
 * 字体设置（字体字号加粗斜体）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/font', function(minder) {

    var $tabs = minder.getUI('ribbon/tabs');
    var commandinputmenu = minder.getUI('widget/commandinputmenu');
    var commandbutton = minder.getUI('widget/commandbutton');

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

    var $fontFamilyMenu = commandinputmenu.generate('fontfamily', minder.getOptions('fontfamily').map(function(ff) {
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

    var $fontSizeMenu = commandinputmenu.generate('fontsize', minder.getOptions('fontsize').map(function(fs) {
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

    var $boldButton = commandbutton.generate('bold');
    var $italicButton = commandbutton.generate('italic');

    $rightPanel.appendWidgets([$boldButton, $italicButton]);

    $fontPanel.appendWidgets([$leftPanel, $rightPanel]);

    $tabs.appearence.appendWidget($fontPanel);
});