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
        $help.removeClass('loading');
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
                    return '<span class="shortcut-key ' + key.toLowerCase() + '">' + key + '</span>';
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