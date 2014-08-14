KityMinder.registerUI('style', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {

    var $stylePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.style')
    }).appendTo($tabs.edit);

    $commandbutton.generate('clearstyle').addClass('large').appendTo($stylePanel);

    var $styleClipPanel = new FUI.Panel({
        column: true
    }).appendTo($stylePanel);

    $commandbutton.generate('copystyle').appendTo($styleClipPanel);
    $commandbutton.generate('pastestyle').appendTo($styleClipPanel);

    return $stylePanel;
});