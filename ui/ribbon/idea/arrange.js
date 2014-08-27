/**
 * @fileOverview
 *
 * 排列节点的两个命令按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/arrange', function(minder) {

    var $tabs = minder.getUI('ribbon/tabs');
    var $commandbutton = minder.getUI('widget/commandbutton');

    var $arrangePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.arrange'),
        column: true
    });

    $commandbutton.generate('arrangeup').appendTo($arrangePanel);
    $commandbutton.generate('arrangedown').appendTo($arrangePanel);

    $tabs.idea.appendWidget($arrangePanel);

    return $arrangePanel;
});