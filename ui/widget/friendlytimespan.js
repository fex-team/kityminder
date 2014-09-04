/**
 * @fileOverview
 *
 * 渲染当前时间离指定时间的时长
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/friendlytimespan', function(minder) {

    $.extend($.fn, {
        displayFriendlyTime: function(time) {
            return this.each(function() {
                display($(this)
                    .addClass('friendly-time')
                    .data('time', time));
            });
        }
    });

    function getTimeText(timeInMs) {
        var ms = Math.abs(timeInMs - new Date()),
            s = ms / 1000,
            m = s / 60,
            h = m / 60,
            d = h / 24;
        if (s < 60) return minder.getLang('ui.justnow', s | 0);
        if (m < 60) return minder.getLang('ui.minutesago', m | 0);
        if (h < 24) return minder.getLang('ui.hoursago', h | 0);
        if (d < 2) return minder.getLang('ui.yesterday');
        if (d <= 30) return minder.getLang('ui.daysago', d | 0);

        return minder.getLang("ui.longago");
    }

    function display($element) {
        $element.text(getTimeText($element.data('time')));
    }

    function update() {
        $('.friendly-time').each(function() {
            display($(this));
        });
    }

    setInterval(update, 60000);
});