KityMinder.registerUI('mainmenu', function(minder) {
    var $button = new FUI.Button({
        id: 'main-menu-btn'
    });

    var $panel;

    $button.setLabel('百度脑图');
    $button.appendTo(document.getElementById('panel'));

    $button.on('click', function(e) {
        $panel.addClass('show');
    });

    $panel = $('<div id="main-menu"></div>').appendTo('body');
    $panel.click(function() {
        $panel.removeClass('show');
    });

    return $panel;
});