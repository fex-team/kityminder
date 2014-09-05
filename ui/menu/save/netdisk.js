/**
 * @fileOverview
 *
 * 保存文件到网盘的功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/save/netdisk', function(minder) {
    var $menu = minder.getUI('menu/menu');
    var $save = minder.getUI('menu/save/save');
    var $netdiskfinder = minder.getUI('widget/netdiskfinder');
    var $eve = minder.getUI('eve');
    var $doc = minder.getUI('doc');
    var ret = $eve.setup({});

    /* extension => protocol */
    var supports = {};

    minder.getSupportedProtocols().forEach(function(protocol) {
        if (protocol.encode && protocol.decode) {
            supports[protocol.fileExtension] = protocol;
        }
    });

    /* 网盘面板 */
    var $panel = $($save.createSub('netdisk', true)).addClass('netdisk-save-panel');

    var $finder = $netdiskfinder.generate($panel, function(file) {
        return supports[file.extension];
    });

    var $selects = $('<div class="netdisk-save-select"></div>')
        .appendTo($panel);

    $('<label>')
        .text(minder.getLang('ui.saveas'))
        .appendTo($selects);

    /* 文件名 */
    var $filename = $('<input>')
        .attr('type', 'text')
        .attr('placeholder', minder.getLang('ui.filename'))
        .attr('title', minder.getLang('ui.filename'))
        .on('keydown', function(e) {
            if (e.keyCode == 27) $menu.toggleClass('show');
        })
        .appendTo($selects);

    /* 文件格式 */
    var $format = $('<select>')
        .attr('title', minder.getLang('ui.fileformat'))
        .appendTo($selects);

    for (var ext in supports) {
        var protocol = supports[ext];
        if (!protocol.encode) return;
        $('<option>')
            .text(protocol.fileDescription + '(' + protocol.fileExtension + ')')
            .val(ext)
            .appendTo($format);
    }

    $format.val('.km');

    /* 保存按钮 */
    var $saveBtn = $('<button></button>')
        .addClass('save-button')
        .text(minder.getLang('ui.save'))
        .click(save)
        .appendTo($selects);

    $menu.on('show', setFileName);

    $finder.on('fileclick', function(file) {
        $finder.select(file.path);
        $filename.val(file.filename);
    });

    function save() {
        var filename = $filename.val();

        if (fio.file.anlysisPath(filename).extension != $format.val()) {
            $filename.val(filename += $format.val())[0].select();
        }

        var path = $finder.pwd() + filename;
        var doc = $doc.current();
        var protocol = supports[$format.val()];

        var exist = $finder.select(path); // 目标路径存在
        var match = doc.path == path; // 目标路径正是当前文档
        var duplicated = exist && !match;

        if (!exist || match || duplicated && window.confirm(minder.getLang('ui.overrideconfirm', filename))) {
            doSave(path, protocol, doc);
        }
    }

    function doSave(path, protocol, doc) {

        $panel.addClass('loading');

        return minder.exportData(protocol.name).then(function(data) {

            return fio.file.write({
                path: path,
                content: data,
                ondup: fio.file.DUP_OVERWRITE
            });

        }).then(function() {

            $panel.removeClass('loading');
            $menu.hide();

            doc.path = path;
            doc.title = $filename.val();
            doc.source = 'netdisk';

            $doc.save(doc);

            setTimeout($finder.list, 500);

        })['catch'](function(e) {

            window.alert('保存文件失败：' + (e.message || minder.getLang('ui.unknownreason')));

        });
    }

    function setFileName() {
        var doc = $doc.current();

        switch (doc.source) {
            case 'netdisk':
                setFileNameForNetDiskSource(doc);
                break;
            default:
                setFileNameForOtherSource(doc);
                break;
        }

        $filename[0].select();
    }

    function setFileNameForNetDiskSource(doc) {
        var path = doc.path;
        var pathInfo = fio.file.anlysisPath(path);

        // 选中当前文件
        if ($finder.pwd() != pathInfo.parentPath) {
            $finder.list(pathInfo.parentPath).then(function() {
                $finder.select(path);
            });
        } else {
            $finder.select(path);
        }

        $filename.val(pathInfo.filename);
    }

    function setFileNameForOtherSource(doc) {
        $filename.val(doc.title);
        $finder.select(null);
    }

    return ret;
});