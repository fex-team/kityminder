KityMinder.registerUI('arrange', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
    var $arrangePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.arrange'),
        column: true
    });

    $commandbutton.generate('arrangeup').appendTo($arrangePanel);
    $commandbutton.generate('arrangedown').appendTo($arrangePanel);

    $tabs.idea.appendWidget($arrangePanel);

    return $arrangePanel;
});