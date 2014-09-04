/**
 * @fileOverview
 *
 * 用 FUI.Tabs 实现的多级的创建
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KM.registerUI('widget/menutab', function(minder) {

    function generate(parent, name, asDefault) {
        var index = parent.getButtons().length;
        var tab = parent.appendTab({
            buttons: [{
                label: minder.getLang('ui.menu.' + name + 'tab'),
                className: 'tab-' + name
            }]
        });
        if (asDefault) {
            parent.select(index);
        }
        return tab[0].panel.getContentElement();
    }

    return {
        generate: generate
    };
});