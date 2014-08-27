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
    var $loader = minder.getUI('widget/fileloader');
    var $netdiskfinder = minder.getUI('widget/netdiskfinder');
    var $eve = minder.getUI('eve');
    var ret = $eve.setup({});


    /* 网盘面板 */
    var $panel = $($open.netdisk.getContentElement());

    var $finder = $netdiskfinder.generate($panel, function(file) {
        return $loader.support(file);
    });

    $finder.on('fileclick', openFile);

    function openFile(file) {
        var protocol = $loader.support(file);

        $menu.removeClass('show');

        return $loader.load(fio.file.read({
            path: file.path,
            dataType: protocol.dataType
        })).then(function(readed) {
            if (readed) ret.fire('fileload', readed);
        });

    }

    ret.loadFileByPath = function(path) {
        var file = new fio.file.File(path);
        return openFile(file);
    };
    return ret;
});