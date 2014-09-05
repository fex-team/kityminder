/**
 * @fileOverview
 *
 * 添加和修改优先级标签
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/priority', function(minder) {

    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $tabs = minder.getUI('ribbon/tabs');

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