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
    var netdisk = minder.getUI('menu/open/netdisk');
    var recentList = minder.getUI('widget/locallist').use('recent');

    /* 网盘面板 */
    var $panel = $($open.recent.getContentElement()).addClass('recent-file-panel');

    /* 路径导航 */
    var $nav = $('<h2>最近使用</h2>')
        .appendTo($panel);

    /* 最近文件列表容器 */
    var $ul = $('<ul></ul>')
        .addClass('recent-file-list')
        .appendTo($panel);

    renderList();

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
                .data('time', item.time)
                .text(frdTime.display(item.time))
                .appendTo($li);
        });
    }

    $ul.delegate('.recent-file-item', 'click', function(e) {
        var path = $(e.target)
            .closest('.recent-file-item')
            .data('path');
        netdisk.loadFileByPath(path);
    });

    netdisk.on('fileload', function(loaded) {
        var exist = recentList.findIndex('path', loaded.file.path);
        if (~exist) {
            recentList.remove(exist);
        }
        recentList.unshift({
            path: loaded.file.path,
            filename: loaded.file.filename,
            title: loaded.json.data.text || minder.getLang('untitleddoc'),
            time: +new Date()
        });
        renderList();
    });

    function updateTime() {
        $ul.find('.file-time').each(function(index, element) {
            $(element).text(frdTime.display($(element).data('time')));
        });
    }

    setInterval(updateTime, 60000);

});