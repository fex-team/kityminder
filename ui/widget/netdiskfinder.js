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
    var notice = minder.getUI('widget/notice');
    var recycleReady = null;
    var base = '/apps/kityminder';
    var recyclePath = base + '/.recycle';
    var moveConfirm = true;
    var instances = [];
    var Finder = eve.setup({});

    Finder.BASE_PATH = base + '/';
    Finder.RECYCLE_PATH = recyclePath + '/';

    Finder.on('mv', function(from, to, source) {
        instances.forEach(function(instance) {
            if (source != instance) instance.refresh();
        });
    });

    /**
     * 生成一个网盘的目录访问组件
     *
     * @param  {JQueryObject} $container 容器
     * @param  {function} listFilter  一个函数，检查一个文件是否应该被列出
     */
    function generate($container, listFilter) {

        var finder = eve.setup({});

        instances.push(finder);

        var currentPath = base;

        var $finder = $('<div class="netdisk-finder"></div>').appendTo($container);

        /* 顶部工具栏 */
        var $headbar = $('<div class="head"></div>').appendTo($finder);

        /* 控制按钮 */
        var $control = $('<div class="control"></div>').appendTo($headbar);

        var $mkdir = $('<a></a>')
            .text(minder.getLang('ui.mkdir'))
            .attr('title', minder.getLang('ui.mkdir'))
            .addClass('button mkdir')
            .appendTo($control)
            .click(mkdir);

        var $recycle = $('<a></a>')
            .text(minder.getLang('ui.recycle'))
            .attr('title', minder.getLang('ui.recycle'))
            .addClass('button recycle dir')
            .data('file', {
                path: recyclePath,
                filename: minder.getLang('ui.recycle')
            })
            .appendTo($control)
            .click(recycle);

        var $recycleClear = $('<a></a>')
            .text(minder.getLang('ui.recycle_clear'))
            .attr('title', minder.getLang('ui.recycle_clear'))
            .addClass('button recycle-clear')
            .appendTo($control)
            .click(clearRecycle);


        /* 路径导航 */
        var $nav = $('<div class="nav"></div>').appendTo($headbar);

        /* 显示当前目录文件列表 */
        var $list = $('<ul class="file-list"></ul>')
            .appendTo($finder);

        var selected = null;

        minder.on('uiready', function() {
            var $user = minder.getUI('topbar/user');
            $user.requireLogin($container);
            fio.user.on('login', function() {
                list();
            });
        });

        handleClick();
        handleDrag();
        handleNav();
        handleRename();

        function handleRename() {

            $list.delegate('.file-list-item a.rename-button', 'click', function(e) {
                var $li = $(e.target).closest('li');
                $li.find('span.filename').remove();
                rename($li);
                $li.addClass('renaming');
                e.stopPropagation();
            });

            function rename($li) {
                rename.onprogress = true;
                var file = $li.data('file');

                var $input = $('<input>')
                    .attr('type', 'text')
                    .addClass('new-dir-name fui-widget fui-selectable')
                    .val(file.filename)
                    .appendTo($li);

                $li.removeAttr('draggable');

                $input.on('keydown', function (e) {
                    if (e.keyCode == 13) return confirm();
                    if (e.keyCode == 27) {
                        e.stopPropagation();
                        return cancel();
                    }
                }).on('blur', cancel);

                $input.on('dragstart mousedown mouseup click dblclick', function(e) {
                    e.stopPropagation();
                });

                setTimeout(function() {
                    $input[0].select();
                });

                function reset(filename) {
                    $input.remove();
                    $li.find('.icon').after('<span class="filename">' + filename + '</span>');
                    $li.removeClass('renaming');
                    $li.attr('draggable', true);
                }

                function cancel() {
                    reset(file.filename);
                }

                function confirm() {
                    var newFilename = $input.val();
                    var newPath = file.parentPath + newFilename;

                    if (file.filename == newFilename) return cancel();
                    if (fio.file.anlysisPath(newFilename).extension != file.extension) {
                        $input.addClass('invalid-name');
                        setTimeout(function () {
                            $input.removeClass('invalid-name'); 
                        }, 500);
                        return $input.select();
                    }

                    $container.addClass('loading');

                    mv(file.path, newPath).then(function () {

                        var oldPath = file.path;
                        file.filename = newFilename;
                        file.path = newPath;
                        reset(newFilename);
                        Finder.fire('mv', oldPath, newPath, finder);
                        notice.info(minder.getLang('ui.rename_success', newFilename));

                    })['catch'](function(e) {

                        notice.error('err_rename', e);
                        cancel();

                    }).then(function() {

                        $container.removeClass('loading');
                        
                    });
                }
            }
        }

        function handleClick() {
            /* 点击目录中的项目时打开项目 */
            $list.delegate('.file-list-item', 'dblclick', function(e) {
                if (currentPath == recyclePath + '/') return;
                if (mkdir.onprogress) return mkdir.onprogress.select();
                var $file = $(e.target).closest('li'),
                    file = $file.data('file');
                if (file) open(file);
            });
            $list.delegate('.file-list-item', 'mousedown', function(e) {
                if (mkdir.onprogress) return mkdir.onprogress.select();
                var $file = $(e.target).closest('li'),
                    file = $file.data('file');
                if (!file) return;
                select(file && file.path);
            });
        }

        function handleNav() {
            /* 点击导航处，切换路径 */
            $nav.delegate('a', 'click', function(e) {
                if (mkdir.onprogress) return mkdir.onprogress.select();
                if ($(e.target).hasClass('dir-back')) {
                    var parts = currentPath.split('/');
                    parts.pop(); // 有一个无效部分
                    parts.pop();
                    return list(parts.join('/'));
                }
                list($(e.target).data('path'));
            });
        }

        function handleDrag() {

            var fileItemSelector = '.file-list-item';
            var dirSelector = '.dir';
            var $dragging = null;

            $list.delegate(fileItemSelector, 'dragstart', itemDragStart)
                .delegate(fileItemSelector, 'dragend', itemDragEnd)
                .delegate(dirSelector, 'dragover', dragOver)
                .delegate(dirSelector, 'dragenter', dirDragEnter)
                .delegate(dirSelector, 'dragleave', dirDragLeave)
                .delegate(dirSelector, 'drop', dirDrop);

            $headbar.delegate(dirSelector, 'dragover', dragOver)
                .delegate(dirSelector, 'dragenter', dirDragEnter)
                .delegate(dirSelector, 'dragleave', dirDragLeave)
                .delegate(dirSelector, 'drop', dirDrop);

            $list.delegate(fileItemSelector + ' input', 'dragstart', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });

            function itemDragStart(e) {
                var $target = $(e.target);
                if (!$target.hasClass('file-list-item')) {
                    return;
                }
                // e.originalEvent.dataTransfer.effectAllowed = "move";
                // e.originalEvent.dataTransfer.dropEffect = 'move';

                try {
                    var dataType = kity.Browser.ie && kity.Browser.version == 10 ? 'text' : 'text/plain';
                    e.originalEvent.dataTransfer.setData(dataType, 'FEX');
                    e.originalEvent.dataTransfer.setDragImage($target.find('.icon').get(0), 12, 12);
                } catch (ignore) {}

                $dragging = $target.addClass('dragging');
                $finder.addClass('drop-mode');
            }

            function itemDragEnd(e) {
                $(e.target).removeClass('dragging');
                e.originalEvent.dataTransfer.dropEffect = 'move';
                e.preventDefault();
                $finder.removeClass('drop-mode');
            }

            function dragOver(e) {
                if ($(e.target).hasClass('filename')) e.preventDefault();
            }

            function dirDragEnter(e) {
                var $target = $(e.target).closest('.dir');
                $target.addClass('drag-enter');
                if (e.target != $target[0]) $target.addClass('enter-child');
            }

            function dirDragLeave(e) {
                if ($(e.target).hasClass('dir')) {
                    if ($(e.target).hasClass('enter-child')) {
                        return $(e.target).removeClass('enter-child');
                    }
                    $(e.target).removeClass('drag-enter');
                }
            }

            function dirDrop(e) {
                e.preventDefault();
                
                var $target = $(e.target).closest('.dir').removeClass('drag-enter');

                if (!$target.hasClass('dir')) return;

                var source = $dragging.data('file');
                var destination = $target.data('file');

                var destinationPath = destination.path + '/' + source.filename;
                var sourcePath = source.path;

                if (destinationPath.indexOf(sourcePath) === 0) return;


                if (!moveConfirm || window.confirm(minder.getLang('ui.move_file_confirm', source.filename, destination.filename))) {
                    $container.addClass('loading');
                    recycleReady.then(doMove);
                    moveConfirm = false;
                }

                function doMove() {
                    mv(sourcePath, destinationPath).then(function() {
                        $dragging.remove();
                        Finder.fire('mv', sourcePath, destinationPath, finder);
                        notice.info(minder.getLang('ui.move_success', source.filename, destination.filename));
                    })['catch'](function(e) {
                        notice.error('err_move_file', e);
                    }).then(function() {
                        $container.removeClass('loading');
                    });
                }
            }
        }

        function recycle() {
            list(recyclePath);
        }

        function createRecycleBin() {
            return fio.file.mkdir({
                path: recyclePath
            });
        }

        function clearRecycle() {
            if (!window.confirm(minder.getLang('ui.recycle_clear_confirm'))) return;

            $container.addClass('loading');

            fio.file['delete']({
                path: recyclePath
            }).then(function() {
                return recycleReady = createRecycleBin();
            }).then(function() {
                renderList([]);
                $container.removeClass('loading');
            });
        }

        function mv(source, destination) {
            return fio.file.move({
                path: source,
                newPath: destination,
                ondup: destination.indexOf(recyclePath) === 0 ? fio.file.DUP_RENAME : fio.file.DUP_FAIL
            });
        }

        function mkdir() {
            if (mkdir.onprogress) {
                return mkdir.onprogress.select();
            }

            var $li = $('<li>').addClass('file-list-item dir').prependTo($list);

            $li.append('<span class="icon"></span>');

            var $input = $('<input>')
                .attr('type', 'text')
                .addClass('new-dir-name fui-widget fui-selectable')
                .val(minder.getLang('ui.newdir'))
                .appendTo($li);

            mkdir.onprogress = $input[0];
            $input[0].select();

            $input.on('keydown', function(e) {
                if (e.keyCode == 13) confirm();
                if (e.keyCode == 27) {
                    cancel();
                    e.stopPropagation();
                }
            }).on('blur', confirm);

            function cancel() {
                $li.remove();
                mkdir.onprogress = false;
            }

            function confirm() {
                var name = $input.val();
                if (name) {
                    $container.addClass('loading');
                    fio.file.mkdir({
                        path: currentPath + name
                    }).then(function() {
                        return new Promise(function(resolve) {
                            setTimeout(function() {
                                resolve(refresh());
                            }, 200);
                        });
                    }, function(e) {
                        if (e.detail && e.detail.error_code == 31061) {
                            e.message = '已存在同名目录';
                        }
                        var notice = minder.getUI('widget/notice');
                        notice.error('err_mkdir', e);
                        $li.remove();
                    }).then(function() {
                        $container.removeClass('loading');
                        mkdir.onprogress = false;
                    });
                }
            }
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

        function refresh() {
            return list(currentPath, true);
        }

        /**
         * 列出指定目录的文件
         */
        function list(path, noAnimate) {

            path = path || base;

            var listPromise = fio.file.list({
                path: path
            });

            var transitPromise = noAnimate ? Promise.resolve() : fadeOutList(-100 * sign(path.length - currentPath.length));

            currentPath = path.charAt(path.length - 1) == '/' ? path : path + '/';

            updateNav();

            function checkRecycleBin(files) {
                if (!recycleReady && path == base) {
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].path == recyclePath) {
                            recycleReady = Promise.resolve(true);
                        }
                        break;
                    }
                    recycleReady = recycleReady || createRecycleBin();
                }
            }

            return Promise.all([listPromise, transitPromise]).then(function(values) {

                var files = values[0];
                checkRecycleBin(files);
                return renderList(files);

            }, function(error) {

                var notice = minder.getUI('widget/notice');
                notice.error('err_ls', error);
            });
        }

        function renderFileList(files) {

            $list.empty();
            if (!files.length) {
                $list.append('<li class="empty" disabled="disabled">' + minder.getLang('ui.emptydir') + '</li>');
            } else {
                files.forEach(function(file) {
                    if (!file.isDir && (!listFilter || !listFilter(file))) return;
                    if (file.path == recyclePath) return;

                    $('<li></li>')
                        .append('<span class="icon"></span>')
                        .append('<span class="filename">' + file.filename + '</span>')
                        .append('<a class="rename-button" title="' + minder.getLang('ui.rename') + '">"' + minder.getLang('ui.rename') + '"</a>')
                        .addClass('file-list-item')
                        .addClass(file.isDir ? 'dir' : 'file')
                        .data('file', file)
                        .attr('draggable', true)
                        .appendTo($list);
                });
            }
        }

        finder._renderFileList = renderFileList;

        function renderList(files) {

            files.sort(function(a, b) {
                if (a.isDir > b.isDir) {
                    return -1;
                } else if (a.isDir == b.isDir) {
                    return a.createTime > b.createTime ? -1 : 1;
                } else return 1;
            });

            renderFileList(files);

            // 通知其他 finder 更新
            instances.forEach(function(instance) {
                if (instance == finder) return;
                if (instance.pwd() == currentPath)
                    instance._renderFileList(files);
            });

            fadeInList();
            checkSelect();

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
                var $a = $('<a></a>').addClass('dir');
                if (part == base) {
                    $a.text(minder.getLang('ui.mydocument'));
                } else if (part == '.recycle') {
                    $a.text(minder.getLang('ui.recycle'));
                    $finder.addClass('recycle-bin');
                } else {
                    $a.text(part);
                }
                return $a.data('path', processPath).data('file', {
                    path: processPath.substr(0, processPath.length - 1),
                    filename: part == base ? minder.getLang('ui.mydocument') : part
                });
            }

            $finder.removeClass('recycle-bin');

            $nav.append(pathButton(base));

            parts.forEach(function(part) {
                if (!part) return;
                $nav.append('<span class="spliter"></span>');
                $nav.append(pathButton(part));
            });
        }

        function select(path) {
            selected = path;
            return checkSelect();
        }

        function checkSelect() {
            var hasSelect = false;
            $list.find('.file-list-item').removeClass('selected').each(function() {
                var file = $(this).data('file');
                if (file && file.path == selected) {
                    $(this).addClass('selected');
                    hasSelect = true;
                    $list[0].focus();
                    finder.fire('select', file, this);
                }
            });
            if (!hasSelect) selected = false;
            return hasSelect;
        }

        function pwd() {
            return currentPath;
        }

        finder.list = list;
        finder.select = select;
        finder.pwd = pwd;
        finder.refresh = refresh;

        return finder;
    }

    Finder.generate = generate;
    return Finder;
});