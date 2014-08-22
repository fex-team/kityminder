KityMinder.registerUI('localfile', ['mainmenu', 'mainmenu.open', 'fileloader'], function(minder, $menu, $open, $loader) {

    // 支持的文件类型
    var supportedExtensions = [];

    Utils.each(minder.getSupportedProtocols(), function(name, protocol) {
        if (protocol && protocol.decode) {
            supportedExtensions.push(protocol.fileExtension);
        }
    });

    supportedExtensions = supportedExtensions.join(', ');

    function readFile(domfile) {
        return new Promise(function(resolve, reject) {

            var file = new fio.file.File(domfile.name);
            var protocol = minder.getProtocol($loader.support(file));
            var reader;

            if (protocol.dataType == 'blob') {

                file.data = new fio.file.Data(domfile);
                resolve(file);

            } else {

                reader = new FileReader();
                reader.onload = function() {
                    file.data = new fio.file.Data(this.result);
                    resolve(file);
                };
                reader.readAsText(domfile, 'utf-8');

            }
        });
    }

    /* 网盘面板 */
    var $panel = $($open.local.getContentElement()).addClass('local-file-open-panel');

    /* 路径导航 */
    var $nav = $('<h2>本地文件</h2>')
        .appendTo($panel);

    var $pick = $('<div class="pick-file"></div>')
        .appendTo($panel);

    var $pickButton = $('<a></a>')
        .text(minder.getLang('ui.pickfile'))
        .appendTo($pick);

    $('<span></span>').text(minder.getLang('ui.acceptfile', supportedExtensions)).appendTo($pick);

    var $drop = $('<div class="drop-file"></div>').appendTo($panel);

    $pickButton.click(function() {
        var $file = $('<input type="file" />')
            .attr('accept', supportedExtensions)
            .on('change', function(e) {
                readFile(this.files[0]).then($loader.load);
                $menu.removeClass('show');
            }).click();
    });


    $open.select(2);
});