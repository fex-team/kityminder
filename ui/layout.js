KityMinder.registerUI('layout', ['tabs', 'commandbuttonset', 'commandbutton'], function(minder, $tabs, $commandbuttonset, $commandbutton) {

    var $layoutPanel = new FUI.LabelPanel({
        id: 'layout-panel',
        label: minder.getLang('panels.layout')
    }).appendTo($tabs.edit);

    var $layoutSelect = new FUI.DropPanel({
        id: 'layout-select'
    }).appendTo($layoutPanel);

    var layoutList = KityMinder.Utils.keys(KityMinder.getLayoutList());

    $layoutSelect.appendWidget($commandbuttonset.generate('layout', layoutList));

    $commandbutton.generate('resetlayout').appendTo($layoutPanel).addClass('large');

    return $layoutPanel;
});