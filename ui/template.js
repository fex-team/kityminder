KityMinder.registerUI('template', ['tabs'], function(minder, $tabs) {

    var buttonset = minder.getUI('commandbuttonset');

    var $templatePanel = new FUI.LabelPanel({
        id: 'template-panel',
        label: minder.getLang('panels.template')
    });

    var $templateSelect = new FUI.DropPanel({
        id: 'template-select'
    });

    $tabs.edit.appendWidget($templatePanel);
    $templatePanel.appendWidget($templateSelect);

    var templateList = KityMinder.Utils.keys(KityMinder.getTemplateList());

    $templateSelect.appendWidget(buttonset.generate('template', templateList));

    return $templatePanel;
});