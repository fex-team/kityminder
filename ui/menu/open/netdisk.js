/**
 * @fileOverview
 *
 * 支持从百度网盘打开文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/netdisk', function(minder) {

    var $menu = minder.getUI('menu/menu');
    var $open = minder.getUI('menu/open/open');
    var $netdiskfinder = minder.getUI('widget/netdiskfinder');
    var $eve = minder.getUI('eve');
    var $doc = minder.getUI('doc');
    var ret = $eve.setup({});
    var notice = minder.getUI('widget/notice');

    /* 网盘面板 */
    var $panel = $($open.createSub('netdisk'));

    /* extension => protocol */
    var supports = {};

    minder.getSupportedProtocols().forEach(function(protocol) {
        if (protocol.decode) {
            supports[protocol.fileExtension] = protocol;
        }
    });

    /* Finder */
    var $finder = $netdiskfinder.generate($panel, function(file) {

        return supports[file.extension];

    });

    $finder.on('fileclick', function(file) {
        if (!$doc.checkSaved()) return;
        return open(file.path);
    });

    function open(path, errorHandler) {

        $menu.hide();

        $(minder.getRenderTarget()).addClass('loading');

        var info = fio.file.anlysisPath(path);
        var protocol = supports[info.extension];

        function read() {
            return fio.file.read({

                path: path,
                dataType: protocol.dataType

            });
        }

        function load(file) {

            var doc = {
                protocol: supports[file.extension].name,
                content: file.data.content,
                title: file.filename,
                source: 'netdisk',
                path: file.path,
                saved: true
            };

            return $doc.load(doc);
        }

        function error(e) {
            return errorHandler && errorHandler(e) || notice.error('err_load', e);
        }

        return read().then(load)['catch'](error).then(function() {

            $(minder.getRenderTarget()).removeClass('loading');

        });

    }

    ret.open = open;

    return ret;
});