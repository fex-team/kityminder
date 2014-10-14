/**
 * @fileOverview
 *
 * 全屏无打扰模式
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('ribbon/view/fullscreen', function(minder) {

    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');
    var notice = minder.getUI('widget/notice');

    var $fullscreenPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.level'),
        column: true
    }).appendTo($tabs.view);

    var $fullscreenButton = $commandbutton
        .generate('fullscreen', fullscreen)
        .addClass('large')
        .appendTo($fullscreenPanel);

    function fullscreen() {
        if ($('#content-wrapper').toggleClass('fullscreen').hasClass('fullscreen')) {
            notice.info(minder.getLang('ui.fullscreen_exit_hint'), false, 4000);
        }
    }

    minder.addShortcut('F11', fullscreen);

    return $fullscreenButton;
});
