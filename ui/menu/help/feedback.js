/**
 * @fileOverview
 *
 * 帮助面板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/help/feedback', function (minder) {
    var $menu = minder.getUI('menu/menu');
    var $panel = $($menu.createSub('feedback'));

    var $feedback = $('<div id="feedback-panel">')
        .appendTo($panel)
        .addClass('loading');

    $.pajax({
        url: 'static/pages/feedback.html',
        dataType: 'text'
    }).then(render);

    function render(template) {
        /* global jhtmls: true */
        var renderer = jhtmls.render(template);
        $feedback.html(renderer({
            lang: minder.getLang('ui'),
            minder: minder
        }));

        $feedback.on('click contextmenu keydown', function(e) {
            e.stopPropagation();
        });

        $feedback.removeClass('loading');
        $feedback.find('.km-version').text(KityMinder.version);
    }

});