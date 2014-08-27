/**
 * @fileOverview
 *
 * 节点颜色设置（包括和背景）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/appearence/color', function(minder) {

    function generateSerisColor() {
        return ['#e75d66', '#fac75b', '#99ca6a', '#00c5ad', '#3bbce0', '#c9ced1', '#425b71', 'white'];
    }

    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $tabs = minder.getUI('ribbon/tabs');

    var $colorPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.color')
    }).appendTo($tabs.appearence);

    var $backgroundPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.background')
    }).appendTo($tabs.appearence);

    var foreColorList = generateSerisColor();

    $colorPanel.appendWidget($commandbuttonset.generate('forecolor', foreColorList.map(function(color) {
        return {
            icon: {
                style: {
                    background: color
                }
            },
            label: color,
            text: color,
            value: color
        };
    })).addClass('color-picker'));

    $backgroundPanel.appendWidget($commandbuttonset.generate('background', foreColorList.map(function(color) {
        return {
            icon: {
                style: {
                    background: color
                }
            },
            label: color,
            text: color,
            value: color
        };
    })).addClass('color-picker'));

    return {
        color: $colorPanel,
        background: $backgroundPanel
    };
});