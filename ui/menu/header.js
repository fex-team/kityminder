/**
 * @fileOverview
 *
 * 菜单头部
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/header', function (minder) {

    var $menu = minder.getUI('menu/menu');

    var $header = $('<div class="main-menu-header"></div>').appendTo($menu);

    var $backPanel = $('<div class="main-menu-back-panel"></div>').appendTo($header);

    var $titlePanel = $('<div class="main-menu-title">百度脑图</div>').appendTo($header);

    var $backButton = new FUI.Button({
        className: 'main-menu-back-button',
        label: minder.getLang('ui.back')
    }).appendTo($backPanel[0]).on('click', function() {
        $menu.removeClass('show');
    });

    return $header;
});