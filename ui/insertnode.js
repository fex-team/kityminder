KityMinder.registerUI('insertnode', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
    var $insertNodePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.insert'),
        column: true
    });

    $commandbutton.generate('appendchildnode').appendTo($insertNodePanel);
    $commandbutton.generate('appendsiblingnode').appendTo($insertNodePanel);

    $tabs.idea.appendWidget($insertNodePanel);

    return $insertNodePanel;
});