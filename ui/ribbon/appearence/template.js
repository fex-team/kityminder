/**
 * @fileOverview
 *
 * 模板选择
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/template', function(minder) {

    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $tabs = minder.getUI('ribbon/tabs');

    var $templatePanel = new FUI.LabelPanel({
        id: 'template-panel',
        label: minder.getLang('panels.template')
    });

    var $templateSelect = new FUI.DropPanel({
        id: 'template-select'
    });

    $tabs.appearence.appendWidget($templatePanel);
    $templatePanel.appendWidget($templateSelect);

    var templateList = KityMinder.Utils.keys(KityMinder.getTemplateList());

    $templateSelect.appendWidget($commandbuttonset.generate('template', templateList));

    return $templatePanel;
});