/**
 * @fileOverview
 *
 * 最近文件功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/recent', function(minder) {

    var $menu = minder.getUI('menu/menu');
    var $open = minder.getUI('menu/open/open');
    var $loader = minder.getUI('widget/fileloader');
    var frdTime = minder.getUI('widget/friendlytimespan');
    var doc = minder.getUI('doc');
    var recentList = minder.getUI('widget/locallist').use('recent');

    /* 网盘面板 */
    var $panel = $($open.createSub('recent')).addClass('recent-file-panel');

    minder.on('uiready', function() {
        minder.getUI('topbar/user').requireLogin($panel);
    });

    /* 标题 */
    var $title = $('<h2></h2>')
        .text(minder.getLang('ui.recent'))
        .appendTo($panel);

    var $clear = $('<button></button>')
        .addClass('clear-recent-list')
        .text(minder.getLang('ui.clearrecent'))
        .appendTo($panel);

    /* 最近文件列表容器 */
    var $ul = $('<ul></ul>')
        .addClass('recent-file-list')
        .appendTo($panel);

    $ul.delegate('.recent-file-item', 'click', function(e) {

        if (!doc.checkSaved()) return;

        var netdisk = minder.getUI('menu/open/netdisk');
        var path = $(e.target)
            .closest('.recent-file-item')
            .data('path');

        netdisk.open(path);
    });

    $clear.on('click', function() {
        if (!window.confirm(minder.getLang('ui.clearrecentconfirm'))) return;
        recentList.clear();
        renderList();
    });

    doc.on('docload', addToList);
    doc.on('docsave', addToList);

    renderList();

    function addToList(doc) {

        if (doc.source != 'netdisk') return;

        var exist = recentList.findIndex('path', doc.path);

        if (~exist) {
            recentList.remove(exist);
        }

        recentList.unshift({
            path: doc.path,
            filename: fio.file.anlysisPath(doc.path).filename,
            title: minder.getMinderTitle(),
            time: +new Date()
        });

        renderList();
    }

    function renderList() {
        $ul.empty();

        recentList.forEach(function(item) {

            var $li = $('<li></li>')
                .addClass('recent-file-item')
                .data('path', item.path)
                .appendTo($ul);

            $('<h4></h4>')
                .addClass('file-name')
                .text(item.filename)
                .appendTo($li);

            $('<p></p>')
                .addClass('file-title')
                .text(item.title)
                .appendTo($li);

            $('<span></span>')
                .addClass('file-time')
                .displayFriendlyTime(item.time)
                .appendTo($li);
        });
    }

    return {
        hasRecent: function() {
            return recentList.length;
        },
        loadLast: function() {
            $ul.find('.recent-file-item').eq(0).click();
        }
    };

});