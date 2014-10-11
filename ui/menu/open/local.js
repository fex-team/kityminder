/**
 * @fileOverview
 *
 * 支持从本地打开文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/local', function(minder) {

    var $menu = minder.getUI('menu/menu');
    var $open = minder.getUI('menu/open/open');
    var $doc = minder.getUI('doc');
    var notice = minder.getUI('widget/notice');

    /* extension => protocol */
    var supports = {};
    var accepts = [];

    minder.getSupportedProtocols().forEach(function(protocol) {
        if (protocol.decode) {
            supports[protocol.fileExtension] = protocol;
            accepts.push(protocol.fileExtension);
        }
    });

    /* 网盘面板 */
    var $panel = $($open.createSub('local')).addClass('local-file-open-panel');

    /* 标题 */
    $('<h2>本地文件</h2>')
        .appendTo($panel);

    /* 选择文件 */
    var $pick = $('<div class="pick-file"></div>')
        .appendTo($panel);

    var $pickButton = $('<a></a>')
        .text(minder.getLang('ui.pickfile'))
        .appendTo($pick);

    $('<span></span>')
        .text(minder.getLang('ui.acceptfile', accepts.map(function(ext) {

            var protocol = supports[ext];
            return protocol.fileDescription + '(' + ext + ')';

        }).join(', '))).appendTo($pick);

    /* 拖放提示 */
    var $drop = $('<div class="drop-file"></div>')
        .append($('<span></span>').html(minder.getLang('ui.dropfile')))
        .appendTo($panel);


    /* 交互事件 */
    $pickButton.click(function() {
        if (!$doc.checkSaved()) return;
        $('<input type="file" />')
            .attr('accept', accepts.join())
            .on('change', function(e) {
                read(this.files[0]);
                $menu.hide();
            }).click();
    });

    var cwrapper = $('#content-wrapper')[0];
    cwrapper.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    cwrapper.addEventListener('drop', function(e) {
        e.preventDefault();

        if (!$doc.checkSaved()) return;

        if (e.dataTransfer.files.length) {
            read(e.dataTransfer.files[0]);
        }
        $menu.hide();
    }, false);

    function read(domfile) {
        if (!domfile) return;

        var info = new fio.file.anlysisPath(domfile.name);
        var protocol = supports[info.extension];

        if (!protocol || !protocol.decode) {
            notice.warn(minder.getLang('ui.unsupportedfile'));
            return Promise.reject();
        }

        function loadFile(file, protocol) {
            return new Promise(function(resolve, reject) {
                var reader;

                if (protocol.dataType == 'blob') {

                    resolve(new fio.file.Data(domfile));

                } else {

                    reader = new FileReader();
                    reader.onload = function() {
                        resolve(new fio.file.Data(this.result));
                    };
                    reader.onerror = reject;
                    reader.readAsText(domfile, 'utf-8');
                }
            });
        }

        function loadFileError() {
            var notice = minder.getUI('widget/notice');
            notice.error('err_localfile_read');
        }

        function loadDoc(data) {
            var doc = {
                content: data.content,
                protocol: protocol.name,
                title: info.filename,
                source: 'local'
            };

            return $doc.load(doc);
        }

        $(minder.getRenderTarget()).addClass('loading');

        return loadFile(domfile, protocol).then(loadDoc, loadFileError).then(function() {

            $(minder.getRenderTarget()).removeClass('loading');

        });
    }

    return {
        read: read
    };
});