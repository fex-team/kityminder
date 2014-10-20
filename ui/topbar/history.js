/**
 * @fileOverview
 *
 * 历史控制按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/history', function(minder) {

    var ret = {};
    var commandbutton = minder.getUI('widget/commandbutton');

    ['undo', 'redo'].forEach(function(command) {
        ret[command] = commandbutton.generate(command).appendTo(document.getElementById('panel'));
    });

    return ret;
});