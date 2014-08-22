KityMinder.registerUI('netdisk', ['mainmenu', 'mainmenu.open', 'fileloader'], function(minder, $menu, $open, $loader) {
    /* 网盘面板 */
    var $panel = $($open.netdisk.getContentElement());

    /* 路径导航 */
    var $nav = $('<div class="netdisk-nav"></div>')
        .appendTo($panel);

    /* 显示当前目录文件列表 */
    var $list = $('<ul></ul>')
        .addClass('netdisk-file-list')
        .appendTo($panel);

    /* 点击目录中的项目时打开项目 */
    $list.delegate('.netdisk-file-list-item', 'click', function(e) {
        var $file = $(e.target),
            file = $file.data('file');
        open(file);
    });

    $nav.delegate('a', 'click', function(e) {
        if ($(e.target).hasClass('dir-back')) {
            var parts = currentPath.split('/');
            parts.pop(); // 有一个无效部分
            parts.pop();
            return list(parts.join('/'));
        }
        list($(e.target).data('path'));
    });

    var base = '/apps/kityminder';
    var currentPath = base;

    var supports = {
        '.km': 'json',
        '.txt': 'plain',
        '.xmind': 'xmind',
        '.mmap': 'mmap',
        '.mm': 'mm'
    };

    function sign(num) {
        return num > 0 ? 1 : (num < 0 ? -1 : 0);
    }

    function open(file) {
        if (file.isDir) return list(file.path);

        var protocol = $loader.support(file);

        if (!protocol) return;
        
        $loader.load(fio.file.read( { 
            path: file.path, 
            dataType: minder.getProtocol(protocol).dataType
        } ));

        $menu.removeClass('show');
    }

    function list(path) {

        Promise.all([

            fio.file.list({
                path: path
            }),

            new Promise(function(resolve, reject) {

                $list.transit({
                    x: -100 * sign(path.length - currentPath.length),
                    opacity: 0
                }, 100, function() {
                    resolve(null);
                });
            })

        ])

        .then(renderList, function(error) {

            window.alert('加载目录发生错误：' + error);

        });

        currentPath = path.charAt(path.length - 1) == '/' ? path : path + '/';

        updateNav();

    }

    function renderList(values) {
        $list.empty();

        if (!values[0].length) {
            $list.append('<li class="empty" disabled="disabled">' + minder.getLang('ui.emptydir') + '</li>');
        }

        values[0].forEach(function(file) {
            if (!file.isDir && !supports[file.extension]) return;
            $('<li></li>')
                .text(file.filename)
                .addClass('netdisk-file-list-item')
                .addClass(file.isDir ? 'dir' : 'file')
                .data('file', file)
                .appendTo($list);
        });
        $list.css({
            x: -parseInt($list.css('x'))
        }).stop().transit({
            x: 0,
            opacity: 1
        });
    }

    function updateNav() {
        $nav.empty();
        if (currentPath != base && currentPath != base + '/') {
            $nav.append('<a class="dir-back">Back</a>');
        } else {
            $nav.append('<span class="my-document"></span>');
        }
        var path = currentPath.substr(base.length);
        var parts = path.split('/');
        var processPath = '';

        function pathButton(part) {
            processPath += part + '/';
            var $a = $('<a></a>');
            if (part == base) {
                $a.text(minder.getLang('ui.mydocument'));
            } else {
                $a.text(part);
            }
            return $a.data('path', processPath);
        }

        $nav.append(pathButton(base));

        parts.forEach(function(part) {
            if (!part) return;
            $nav.append('<span class="spliter"></span>');
            $nav.append(pathButton(part));
        });
    }


    $open.once('select', function() {
        fio.user.check().then(function() {
            list(currentPath);
        });
    });

});