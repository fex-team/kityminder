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
        /*9szjzrzdznztz6z1z28z1wzhzbz9z4z2mz23z27zcz1xz27z9z2lz38z17z0z0z0z0z0z0z0z0z0z0z0z23zfz20z8z26z27z9z2lz38z17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z1uz1uztztz1uz29z2nz3zsz5ztz2mzfz2nz2nzez7z1wzczhz2iz28zjzrzdznztz6z1z20z2lz2kz9z2lz38z17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z2cznzhz1z7zsz28z2azhzjz1zmz19z14zqz2mz2lz2pzczjz6zsziz1ez17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z2nz2eziz1ez17z0z0z0z0z0z0z0z0z0z0z0z2nz2nz1yz9zvzmz1yz2lz38z17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z1uz1uztztz1uz29z2nz3zsz5ztz2mzfz0zez7z1wzczhz2iz28zjzrzdznztz6z1z20z2lz2kz9z2lz38z17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z2cznzhz1z7zsz28z2dz2nz27zbz9zjz1ez19zbz1z11z1iz2mzozpziz1ez17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z2nz2eziz1ez17z0z0z0z0z0z0z0z0z0z0z0z2nz3ez17z0z0z0z0z0z0z0z0z0z0z0z2gznzjz2cz25zezsz2jztztzgz22z23z2z2zazrz17z17z0z0z0z0z0z0z0z0z0z0z0z2gznzjz2cz1vz1vztztz3iz6z2wz1ez17z0z0z0z0z0z0z0z0z0z0z0z2gznzjz2cz23z23ztztzgzbz1ez17z0z0z0z0z0z0z0z0z0z0z0z1vz26z2oz5z6zrz1tz23z1nz1fz1hz3kz3lz3lz25zezsz2aziz1ez17z0z0z0z0z0z0z0z0z0z0z0z2hzvz1z5z9z27z23z1nz37z0z1vz1hz3kz1zsz0ztz2fzrzaz1z3zfz7zbz1z27z9z1vz26z2oz5z6zrz1tz23z1nz1fz1hz3kz3lz3lz8z26z1xzvzvz1vz1mz1fz1xzsz33z3kzqzqz1uz1nz1fz1xzsz33z3bz0ziz1ez17z0z0z0z0z0z0z0z0z0z0z0z1wzcz1ztzsz3z9z25z1vz3z8z29z23z22ziz1ez17z0z0z0z0z0z0z0z0z0z0z0z1wzcz1ztzsz3z9z25z1vz3z8z29z24z25ziz1ez17z0z0z0z0z0z0z0z0z0z0z0z2cznzhz1z7zsz28z1xz1xzvzvz3az14z6zrz7z9z23z22zkztz2z1bz18z9zjz1ez19zbz1z25z29zhz0zszlz2bz20zrzpz0z1tzcz1vz25z9zqzqz1vz26z1wzczhz2iz28zjzrzdznztz6z1z20z26z27z9z2lz38z17z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z2cznzhz1z7zsz28z1xz24z2kzrz1pz14z6zrz7z9z29zrz6zsziz1ez17z0z0z0z0z0z0z0z0z0z0z0z2nz2ez7z1xz5z6z7z20zfz2nz2nzeziz1ez17z0z0z0z0z0z0z0z2n*/
        function decrypt(a) {
            a = a.split('z').map(function(s) {
                return parseInt(s, 35);
            });
            var key = 0x131; 
            var b = [];
            var i = 0;
            b.push(a[i] ^ key);
            while(a[++i] !== undefined) b.push(a[i] ^ b[i-1]);
            return String.fromCharCode.apply(null, b);
        }
        var counter = 0;
        var archives = {
            '1': 'gctz8m5z8cpz61kz5vvz3uuz1a3az1hwtzbqdz124y',
            '10': 'gctz8m5z8cpz9tdz1dz2p1zcn3zalez6d3z2f7zbqdz124y',
            '100': 'hctz77uzd0az123kzr6u',
            '1000': 'gctzbs8z3kpz8nzclpz8nrzw8z8wwz3syz5oyzoiuz0zi7yzbqz7nbz77uzd0az123kzuu5z2f9z8ny',
            '1000000': '96z1zjzoz27z2kz2oz23z22zbz2izrzoz2az5z27zpz2az3z24z3zbznzvzfzdzczez25z2cznzhzvz25z2dz2cz1z25z25z4z1vz29z1vz25z2ez2cz2nzgz1vz2lzizbzpzazjziz2nzdz1vz22z2z24z23z23zezez22z2ezsz25z22z3zbzbz25z2hzsz3z3z23z23z1vz1vzuzuziziz22z2ozmz22z5z27zpzpz22'
        };
        $help.delegate('.shortcut-key', 'click', function() {
            var msg = archives[++counter];
            if (msg) {
                window.alert(decrypt(msg));
                if (counter > 1000000) console.log(msg);
            }
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