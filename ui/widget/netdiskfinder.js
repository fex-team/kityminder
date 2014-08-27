/**
 * @fileOverview
 *
 * 网盘的目录访问组件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/netdiskfinder', function(minder) {

    var eve = minder.getUI('eve');

    /**
     * 生成一个网盘的目录访问组件
     *
     * @param  {JQueryObject} $container 容器
     * @param  {function} listFilter  一个函数，检查一个文件是否应该被列出
     */
    function generate($container, listFilter) {

        var finder = eve.setup({});

        var base = '/apps/kityminder';
        var currentPath = base;

        /* 路径导航 */
        var $nav = $('<div class="netdisk-nav"></div>')
            .appendTo($container);

        /* 显示当前目录文件列表 */
        var $list = $('<ul class="netdisk-file-list"></ul>')
            .appendTo($container);

        var $tip = $('<p class="login-tip"></p>')
            .html(minder.getLang('ui.requirelogin'))
            .appendTo($container);

        var $mkdir = $('<a></a>')
            .text(minder.getLang('ui.mkdir'))
            .addClass('button netdisk-mkdir')
            .click(mkdir);

        $nav.after($mkdir);

        $container.addClass('netdisk-finder-container');

        /* 点击目录中的项目时打开项目 */
        $list.delegate('.netdisk-file-list-item', 'click', function(e) {
            var $file = $(e.target),
                file = $file.data('file');
            if (file) open(file);
        });

        /* 点击导航处，切换路径 */
        $nav.delegate('a', 'click', function(e) {
            if ($(e.target).hasClass('dir-back')) {
                var parts = currentPath.split('/');
                parts.pop(); // 有一个无效部分
                parts.pop();
                return list(parts.join('/'));
            }
            list($(e.target).data('path'));
        });

        fio.user.on('login', show);
        fio.user.on('logout', hide);
        hide();

        function mkdir() {
            var $li = $('<li>').addClass('netdisk-file-list-item dir').prependTo($list);
            var $input = $('<input>')
                .attr('type', 'text')
                .addClass('new-dir-name')
                .val(minder.getLang('ui.newdir'))
                .appendTo($li);
            $input[0].select();
            $input.on('keydown', function(e) {
                if (e.keyCode == 13) {
                    var name = $input.val();

                    $li.remove();
                }
            });
        }

        function show() {
            $container.removeClass('require-login');
            list();
        }

        function hide() {
            $container.addClass('require-login');
        }

        /**
         * 返回数值的符号：
         *     正数 => 1
         *       0 => 0
         *     负数 => -1
         */
        function sign(num) {
            return num > 0 ? 1 : (num < 0 ? -1 : 0);
        }

        /**
         * 打开选中的文件或目录
         *
         * @param  {fio.file.File} file
         */
        function open(file) {
            if (file.isDir) return list(file.path);
            finder.fire('fileclick', file);
        }

        function fadeOutList(x) {
            return new Promise(function(resolve, reject) {
                $list.transit({
                    x: x,
                    opacity: 0
                }, 100, resolve);
            });
        }

        function fadeInList() {
            return new Promise(function(resolve) {
                $list.css({
                    x: -parseInt($list.css('x'))
                }).stop().transit({
                    x: 0,
                    opacity: 1
                }, 100, resolve);  
            });
        }

        /**
         * 列出指定目录的文件
         */
        function list(path) {

            path = path || base;

            var listPromise = fio.file.list({
                path: path
            });

            var transitPromise = fadeOutList(-100 * sign(path.length - currentPath.length));

            Promise.all([listPromise, transitPromise]).then(renderList, function(error) {
                window.alert('加载目录发生错误：' + error);
            });

            currentPath = path.charAt(path.length - 1) == '/' ? path : path + '/';

            updateNav();

        }

        function renderList(values) {
            $list.empty();

            var files = values[0];

            if (!files.length) {
                $list.append('<li class="empty" disabled="disabled">' + minder.getLang('ui.emptydir') + '</li>');
            } else {

                files.forEach(function(file) {
                    if (!file.isDir && (!listFilter || !listFilter(file))) return;

                    $('<li></li>')
                        .text(file.filename)
                        .addClass('netdisk-file-list-item')
                        .addClass(file.isDir ? 'dir' : 'file')
                        .data('file', file)
                        .appendTo($list);
                });
            }

            fadeInList();

            finder.fire('cd', currentPath);
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

        finder.list = list;

        return finder;
    }

    return {
        generate: generate
    };
});