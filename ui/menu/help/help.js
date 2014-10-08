/**
 * @fileOverview
 *
 * 帮助面板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/help/help', function (minder) {
    var $menu = minder.getUI('menu/menu');
    var $panel = $($menu.createSub('help'));

    var $help = $('<div id="help-panel">')
        .appendTo($panel)
        .addClass('loading');

    Promise.all([$.pajax({
        url: 'static/pages/helpcontent.html',
        dataType: 'text'
    }), $.pajax({
        url: 'static/pages/operation.' + minder.getOptions('lang') + '.txt',
        dataType: 'text'
    })])

    .then(function(values) {
        var template = values[0];
        var operation = values[1];
        render(template, operation);
    });

    function render(template, operation) {
        /* global jhtmls: true */
        var renderer = jhtmls.render(template);
        $help.html(renderer({
            lang: minder.getLang('ui'),
            minder: minder
        }));

        $help.find('.shortcut-content').html(convert(operation));
        if (kity.Browser.mac) {
            $help.addClass('mac');
        }
        $help.removeClass('loading');
        $help.find('.km-version').text(KityMinder.version);

        // 彩蛋：点很多次按钮的蛋疼
        var counter = 0;
        var archives = {
            '1': '你是个勇于尝试的人！',
            '10': '你是个愿意深入探索的人！',
            '100': '别点了，累',
            '1000': '你真是最孤独的屌丝啊……真的别点了，没有了'
        };
        $help.delegate('.shortcut-key', 'click', function() {
            var msg = archives[++counter];
            if (msg) window.alert(msg);
        });
    }

    function convert(markdown) {
        var html = '';
        var titleReg = /##\s(.+)$/;
        var declareReg = /(.+?)\:\s(.+)$/;

        var section = false;

        markdown.split('\n').forEach(convertLine);

        if (section) {
            html += '</section>';
        }

        function convertLine(line) {
            var match = titleReg.exec(line);
            if (match) {
                if (section) html += '</section>';
                html += '<section><h3>' + match[1] + '</h3>';
                section = true;
                return;
            }
            match = declareReg.exec(line);
            if (match) {
                var declare = match[1];
                var description = match[2];
                html += '<div class="shortcut-group"><span class="shortcut">';
                html += declare.replace(/\`(.+?)\`/g, function(match, key) {
                    return '<span class="shortcut-key ' + key.toLowerCase() + '" title="' + key + '">' + key + '</span>';
                });
                html += '</span>';
                html += '<span class="description">' + description + '</span>';
                html += '</div>';
                return;
            }
        }

        return html;
    }
});