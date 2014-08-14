KityMinder.registerUI('nodeop', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
    var $opPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.nodeop'),
        column: true
    }).appendTo($tabs.idea);

    ['editnode', 'removenode'].forEach(function(cmd) {
        $commandbutton.generate(cmd).appendTo($opPanel);
    });
});