/**
 * @fileOverview
 *
 * 样式控制
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/style', function(minder) {

    var $tabs = minder.getUI('ribbon/tabs');
    var $commandbutton = minder.getUI('widget/commandbutton');

    var $stylePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.style')
    }).appendTo($tabs.appearence);

    $commandbutton.generate('clearstyle').addClass('large').appendTo($stylePanel);

    var $styleClipPanel = new FUI.Panel({
        column: true
    }).appendTo($stylePanel);

    $commandbutton.generate('copystyle').appendTo($styleClipPanel);
    $commandbutton.generate('pastestyle').appendTo($styleClipPanel);

    return $stylePanel;
});