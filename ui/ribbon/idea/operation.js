/**
 * @fileOverview
 *
 * 节点操作（编辑和删除）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/operation', function(minder) {

    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');

    var $opPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.nodeop'),
        column: true
    }).appendTo($tabs.idea);

    ['editnode', 'removenode'].forEach(function(cmd) {
        $commandbutton.generate(cmd).appendTo($opPanel);
    });
});