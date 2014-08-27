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
    var ret = $eve.setup({});

    var protocols = minder.getSupportedProtocols().filter(function(protocol) {
        return protocol.encode;
    });

    /* 网盘面板 */
    var $panel = $($save.netdisk.getContentElement()).addClass('netdisk-save-panel');

    var $finder = $netdiskfinder.generate($panel, function(file) {
        return protocols.some(function(protocol) {
            return protocol.fileExtension == file.extension;
        }, false);
    });

    var $selects = $('<div class="netdisk-save-select"></div>')
        .appendTo($panel);

    $('<label>')
        .text(minder.getLang('ui.saveas'))
        .appendTo($selects);

    var $filename = $('<input>')
        .attr('placeholder', minder.getLang('ui.filename'))
        .attr('title', minder.getLang('ui.filename'))
        .appendTo($selects);

    var $format = $('<select>')
        .attr('title', minder.getLang('ui.fileformat'))
        .appendTo($selects);

    protocols.forEach(function(protocol) {
        $('<option>')
            .text(protocol.fileDescription + '(' + protocol.fileExtension + ')')
            .val(protocol.name)
            .appendTo($format);
    });

    $format.val('json');

    var $saveBtn = $('<button></button>')
        .addClass('save-button')
        .text(minder.getLang('ui.save'))
        .appendTo($selects);

    return ret;
});