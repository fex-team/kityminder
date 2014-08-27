/**
 * @fileOverview
 *
 * 附件面板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/attachment', function(minder) {
    var $tabs = minder.getUI('ribbon/tabs');

    var $attachmentPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.attachment'),
        coloum: true
    }).appendTo($tabs.idea);

    return $attachmentPanel;
});