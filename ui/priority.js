KityMinder.registerUI('priority', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

    var $priorityPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.priority')
    }).appendTo($tabs.idea);

    $commandbuttonset.generate('priority', [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function(p) {
        return {
            label: p,
            text: minder.getLang('ui.priority') + p,
            value: p,
            className: ['priority', p].join('-')
        };
    })).appendTo($priorityPanel);

    return $priorityPanel;
});