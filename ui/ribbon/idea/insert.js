/**
 * @fileOverview
 *
 * 插入节点
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/insert', function(minder) {
    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');

    var $insertNodePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.insert'),
        column: true
    });

    $commandbutton.generate('appendchildnode').appendTo($insertNodePanel);
    $commandbutton.generate('appendsiblingnode').appendTo($insertNodePanel);

    $tabs.idea.appendWidget($insertNodePanel);

    return $insertNodePanel;
});