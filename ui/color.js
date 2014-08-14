function generateSerisColor() {
    return ['#e75d66', '#fac75b', '#99ca6a', '#00c5ad', '#3bbce0', '#c9ced1', '#425b71', 'white'];
}

KityMinder.registerUI('color', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {
    var $colorPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.color')
    }).appendTo($tabs.edit);

    var $backgroundPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.background')
    }).appendTo($tabs.edit);

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