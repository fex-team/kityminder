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

    $('#content-wrapper').on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }).on('drop', function(e) {
        if (!$doc.checkSave()) return;
        e = e.originalEvent;
        read(e.dataTransfer.files[0]);
        $menu.hide();
        e.preventDefault();
    });

    function read(domfile) {
        if (!domfile) return;

        var info = new fio.file.anlysisPath(domfile.name);
        var protocol = supports[info.extension];

        var dataPromise = new Promise(function(resolve, reject) {

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

        $(minder.getRenderTarget()).addClass('loading');

        return dataPromise.then(function(data) {

            var doc = {
                content: data.content,
                protocol: protocol.name,
                title: info.filename,
                source: 'local'
            };

            return $doc.load(doc);

        })['catch'](function(error) {

            window.alert(minder.getLang('ui.errorloading', error.message || minder.getLang('ui.unknownreason')));

        }).then(function() {

            $(minder.getRenderTarget()).removeClass('loading');

        });
    }

    return {
        read: read
    };
});