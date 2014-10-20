/**
 * @fileOverview
 *
 * 布局面板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/layout', function(minder) {

    var $tabs = minder.getUI('ribbon/tabs');
    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $commandbutton = minder.getUI('widget/commandbutton');

    var $layoutPanel = new FUI.LabelPanel({
        id: 'layout-panel',
        label: minder.getLang('panels.layout')
    }).appendTo($tabs.appearence);

    // var $layoutSelect = new FUI.DropPanel({
    //     id: 'layout-select'
    // }).appendTo($layoutPanel);

    // var layoutList = KityMinder.Utils.keys(KityMinder.getLayoutList());

    // $layoutSelect.appendWidget($commandbuttonset.generate('layout', layoutList));

    $commandbutton.generate('resetlayout').appendTo($layoutPanel).addClass('large');

    return $layoutPanel;
});