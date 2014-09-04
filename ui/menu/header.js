/**
 * @fileOverview
 *
 * 菜单头部
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/header', function(minder) {

    var $menu = minder.getUI('menu/menu');

    var $header = $('<div class="main-menu-header"></div>')
        .prependTo($menu.$panel);

    var $backPanel = $('<div class="main-menu-back-panel"></div>')
        .appendTo($header);

    var $titlePanel = $('<div class="main-menu-title">百度脑图</div>')
        .appendTo($header);

    var $backButton = new FUI.Button({

        className: 'main-menu-back-button',
        label: minder.getLang('ui.back')

    }).appendTo($backPanel[0]).on('click', $menu.hide);

    $menu.on('show', function() {
        var $title = minder.getUI('topbar/title');
        $titlePanel.text($title.getTitle());
    });

    return $header;
});