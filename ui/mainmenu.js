KityMinder.registerUI('mainmenu', function(minder) {
    var $mainMenuButton = new FUI.Button({
        id: 'main-menu-btn'
    });

    var $panel;

    $mainMenuButton.setLabel('百度脑图');
    $mainMenuButton.appendTo(document.getElementById('panel'));

    $mainMenuButton.on('click', function(e) {
        $panel.addClass('show');
    });

    $panel = $('<div id="main-menu"></div>').appendTo('body');

    return $panel.addClass('show2');
});