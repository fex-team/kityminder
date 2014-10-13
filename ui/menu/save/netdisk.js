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
    var notice = minder.getUI('widget/notice');

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
        .addClass('fui-widget fui-selectable')
        .attr('type', 'text')
        .attr('placeholder', minder.getLang('ui.filename'))
        .attr('title', minder.getLang('ui.filename'))
        .on('keydown', function(e) {
            if (e.keyCode == 27) $menu.toggle();
            if (e.keyCode == 13) save();
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

    ret.quickSave = quickSave;

    window.onbeforeunload = function() {
        var noask = ret.mute || window.location.href.indexOf('noask') > 0;
        if (!$doc.checkSaved(true) && !noask)
            return minder.getLang('ui.unsavedcontent', '* ' + $doc.current().title);
    };

    var autoSaveDuration = minder.getOptions('autoSave');

    if (autoSaveDuration !== false) {
        autoSaveDuration = isNaN(autoSaveDuration) ? 3000 : (autoSaveDuration * 1000);
        autoSave();
    }

    var autoSaveTimer = 0;

    function autoSave() {
        function lazySave() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveCurrent, autoSaveDuration);
        }
        $doc.on('docchange', lazySave);
    }

    // 快速保存
    function quickSave() {
        var doc = $doc.current();
        if (doc.source != 'netdisk' && !$menu.isVisible()) {
            $menu.$tabs.select(2);
            $save.$tabs.select(0);
            return $menu.show();
        } else {
            saveCurrent();
        }
    }

    function saveCurrent() {
        var doc = $doc.current();

        if (doc.source != 'netdisk' || doc.saved ) return Promise.resolve();

        var $title = minder.getUI('topbar/title').$title;
        $filename.val(doc.title);
        return doSave(doc.path, doc.protocol, doc, $title, 'leaveTheMenu');
    }

    function getSaveContext() {
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

        return {
            filename: filename,
            path: path,
            doc: doc,
            protocol: protocol,
            exist: exist,
            match: match,
            duplicated: duplicated
        };
    }

    function save() {
        var ctx = getSaveContext();

        if (ctx.match || !ctx.exist || ctx.duplicated && window.confirm(minder.getLang('ui.overrideconfirm', ctx.filename))) {
            doSave(ctx.path, ctx.protocol.name, ctx.doc, $panel);
        }
    }

    var saving = 0;

    function doSave(path, protocol, doc, $mask, leaveTheMenu, msg) {

        if (saving) return;

        saving = true;

        if ($mask) $mask.addClass('loading');

        function upload(data) {
            return fio.file.write({
                path: path,
                content: data,
                ondup: fio.file.DUP_OVERWRITE
            });
        }

        function finish(file) {

            if (!file.modifyTime) throw new Error('File Save Error');

            if (!leaveTheMenu) {
                $menu.hide();
            }

            doc.path = file.path;
            doc.title = file.filename;
            doc.source = 'netdisk';
            doc.protocol = protocol;

            $doc.save(doc);

            notice.info(msg || minder.getLang('ui.save_success', doc.title, file.modifyTime.toLocaleTimeString()));

            setTimeout(function() {
                $finder.list($finder.pwd(), true);
            }, 1499);

        }

        function error(e) {
            notice.error('err_save', e);
        }

        return minder.exportData(protocol).then(upload).then(finish, error).then(function() {
            if ($mask) $mask.removeClass('loading');
            saving = false;
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
        if (!fio.user.current()) return;

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