/**
 * @fileOverview
 *
 * 切换展开层次
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('ribbon/view/level', function(minder) {

    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');

    var $levelPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.level'),
        column: true
    }).appendTo($tabs.view);

    ['expandtoleaf', 'collapsetolevel1'].forEach(function(cmd) {
        $commandbutton.generate(cmd).appendTo($levelPanel);
    });
});
