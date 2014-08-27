/**
 * @fileOverview
 *
 * 主菜单控制
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/menu', function(minder) {

    var $mainMenuButton = new FUI.Button({
        id: 'main-menu-btn'
    });

    var $panel;

    $mainMenuButton.setLabel('百度脑图');
    $mainMenuButton.appendTo(document.getElementById('panel'));

    $mainMenuButton.on('click', function(e) {
        $panel.addClass('show');
    });

    $panel = $('<div id="main-menu"></div>').appendTo('#content-wrapper');

    $(window).keydown(function(e) {
        // ESC Pressed
        if (e.keyCode == 27) {
            $panel.toggleClass('show');
        }
    });

    return $panel.addClass('show');
});