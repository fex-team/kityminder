/**
 * @fileOverview
 *
 * 导出数据到本地
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/save/download', function(minder) {
    var $menu = minder.getUI('menu/menu');
    var $save = minder.getUI('menu/save/save');

    /* 导出面板 */
    var $panel = $($save.createSub('download')).addClass('download-panel');

    /* 标题 */
    var $title = $('<h2></h2>')
        .text(minder.getLang('ui.menu.downloadheader'))
        .appendTo($panel);

    var $list = $('<ul>')
        .addClass('download-list')
        .appendTo($panel);

    var supports = [];

    minder.getSupportedProtocols().forEach(function(protocol) {
        if (protocol.encode) {
            supports.push(protocol);
        }
    });

    supports.forEach(function(protocol) {
        $('<li>')
            .addClass(protocol.name)
            .text(protocol.fileDescription + ' (' + protocol.fileExtension + ')')
            .data('protocol', protocol)
            .appendTo($list);
    });

    $list.delegate('li', 'click', function(e) {
        var protocol = $(e.target).data('protocol');
        if (!$panel.hasClass('loading')) doExport(protocol);
    });

    function doExport(protocol) {
        var filename = minder.getMinderTitle() + protocol.fileExtension;
        var mineType = protocol.mineType || 'text/plain';

        $panel.addClass('loading');

        minder.exportData(protocol.name).then(function(data) {

            if (typeof(data) != 'string') return;

            switch (protocol.dataType) {
                case 'text':
                    return doDownload(buildDataUrl(mineType, data), filename, 'text');
                case 'base64':
                    return doDownload(data, filename, 'base64');
            }

            return null;

        })['catch'](function exportError(e) {
            var notice = minder.getUI('widget/notice');
            return notice.error('err_download', e);
        })

        .then(function done(tick) {
            $panel.removeClass('loading');
        });
    }

    function doDownload(url, filename, type) {
        var stamp = +new Date() * 1e5 + Math.floor(Math.random() * (1e5 - 1));

        stamp = stamp.toString(36);

        var ret = new Promise(function(resolve, reject) {
            var ticker = 0;
            var MAX_TICK = 30;
            var interval = 1000;

            function check() {
                if (document.cookie.indexOf(stamp + '=1') != -1) return resolve([stamp, ticker]);
                if (++ticker > MAX_TICK) {
                    resolve([stamp, ticker]);
                }
                setTimeout(check, interval);
            }

            setTimeout(check, interval);
        });

        var content = url.split(',')[1];

        var $form = $('<form></form>').attr({
            'action': 'download.php',
            'method': 'POST',
            'accept-charset': 'utf-8'
        });

        var $content = $('<input />').attr({
            name: 'content',
            type: 'hidden',
            value: decodeURIComponent(content)
        }).appendTo($form);

        var $type = $('<input />').attr({
            name: 'type',
            type: 'hidden',
            value: type
        }).appendTo($form);

        var $filename = $('<input />').attr({
            name: 'filename',
            type: 'hidden',
            value: filename
        }).appendTo($form);

        if (kity.Browser.ie) {
            $('<input name="iehack" value="1" />').appendTo($form);
        }
        $('<input name="stamp" />').val(stamp).appendTo($form);

        var netdisk = minder.getUI('menu/save/netdisk');
        if (netdisk) {
            netdisk.mute = true;
            setTimeout(function() {
                netdisk.mute = false;
            }, 1000);
        }

        $form.appendTo('body').submit().remove();

        return ret;
    }

    function buildDataUrl(mineType, data) {
        return 'data:' + mineType + '; utf-8,' + encodeURIComponent(data);
    }
});