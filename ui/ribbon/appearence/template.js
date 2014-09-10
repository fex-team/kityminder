/**
 * @fileOverview
 *
 * 模板选择
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/template', function(minder) {

    var $commandselectmenu = minder.getUI('widget/commandselectmenu');
    var $tabs = minder.getUI('ribbon/tabs');

    var $templatePanel = new FUI.LabelPanel({
        id: 'template-panel',
        label: minder.getLang('panels.template')
    });


    var templateList = KityMinder.Utils.keys(KityMinder.getTemplateList());
    var $templateSelect = $commandselectmenu.generate('template', templateList, 2);

    $tabs.appearence.appendWidget($templatePanel);
    $templatePanel.appendWidget($templateSelect);

    return $templatePanel;
});