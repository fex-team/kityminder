KityMinder.registerUI('mainmenu.header', ['mainmenu'], function (minder, $mainmenu) {

    var $header = $('<div class="main-menu-header"></div>').appendTo($mainmenu);

    var $backPanel = $('<div class="main-menu-back-panel"></div>').appendTo($header);

    var $titlePanel = $('<div class="main-menu-title"></div>').appendTo($header);

    var $backButton = new FUI.Button({
        className: 'main-menu-back-button',
        label: minder.getLang('ui.back')
    }).appendTo($backPanel[0]).on('click', function() {
        $mainmenu.removeClass('show');
    });

    return $header;
});