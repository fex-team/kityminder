KityMinder.registerUI('attachment', ['tabs'], function(minder, $tabs) {
    var $attachmentPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.attachment'),
        coloum: true
    }).appendTo($tabs.idea);

    return $attachmentPanel;
});