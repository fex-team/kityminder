KityMinder.registerUI('progress', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

    var $progressPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.progress')
    }).appendTo($tabs.idea);

    $commandbuttonset.generate('progress', [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function(p) {
        return {
            label: p,
            text: minder.getLang('ui.progress.p' + p),
            value: p,
            className: ['progress', p].join('-')
        };
    })).appendTo($progressPanel);

    return $progressPanel;
});