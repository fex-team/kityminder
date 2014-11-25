/**
 * @fileOverview
 *
 * 显示并更新脑图文件的标题
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/title', function(minder) {
    var $title = $('<h1>').appendTo('#panel');
    var $doc = minder.getUI('doc');
    var finder = minder.getUI('widget/netdiskfinder');
    var notice = minder.getUI('widget/notice');
    var renameEnabled = false;
    var renameMode = false;

    $doc.on('docchange', update);

    $title.on('click', rename);

    function rename() {
        if (!renameEnabled || renameMode) return;

        var doc = $doc.current();

        var $input = $('<input>').width($title.find('.title-content').width());
        var oldFilename = doc.title;
        var oldPath = doc.path;

        $input.val(oldFilename);
        setTimeout(function() {
            $input[0].select();
        });

        $title.addClass('rename-mode');
        $title.empty();
        $title.append($input);

        renameMode = true;

        $input.on('keydown', function(e) {
            if (e.keyCode == 13) confirm();
            else if (e.keyCode == 27) {
                cancel();
                e.stopPropagation();
            }
        }).on('blur', cancel);

        function exit() {
            setTimeout(function() {
                renameMode = false;
            });
        }

        function cancel() {
            update();
            exit();
        }

        function confirm() {
            var newFilename = $input.val();
            var oldFilenameInfo = fio.file.anlysisPath(oldFilename);
            var newFilenameInfo = fio.file.anlysisPath(newFilename);

            if (!newFilenameInfo.name.length) return cancel();

            newFilename = newFilenameInfo.name + oldFilenameInfo.extension;

            var newPath = fio.file.anlysisPath(oldPath).parentPath + newFilename;

            if (newPath == oldPath) return cancel();

            $title.addClass('loading');

            fio.file.move({
                path: oldPath,
                newPath: newPath
            }).then(function() {
                doc.path = newPath;
                doc.title = newFilename;
                finder.fire('mv', oldPath, newPath);
                notice.info(minder.getLang('ui.rename_success', newFilename));
            })['catch'](function(e) {
                notice.error('err_rename', e);
            }).then(function() {
                $title.removeClass('loading');
                update();
                exit();
            });
        }
    }

    function enableRename(enabled) {
        renameEnabled = enabled;
        if (enabled) $title.addClass('rename-enabled');
        else $title.removeClass('rename-enabled');
    }

    function update() {

        var doc = $doc.current();

        function setTitle(title) {
            if (setTitle.lastValue == title) return;

            title = title || minder.getLang('ui.untitleddoc');
            $title.empty().append($('<span class="title-content"></span>').text(title));
            document.title = title ? title + ' - 百度脑图' : '百度脑图';

            setTitle.lastValue = title;
        }

        if (doc.saved) {
            setTitle(doc.title);
        } else {
            setTitle('* ' + doc.title);
        }

        enableRename(doc.source == 'netdisk' && doc.saved);
    }

    update();

    return {
        $title: $title,

        getTitle: function() {
            return $doc.current().title;
        }
    };
});