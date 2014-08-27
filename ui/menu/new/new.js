/**
 * @fileOverview
 *
 * 新建文件菜单
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/new/new', function(minder) {

    var $menu = minder.getUI('menu/menu');
    var $level1 = minder.getUI('menu/level1');
    var eve = minder.getUI('eve');

    var $panel = $level1['new'].getContentElement();

    var $h2 = $('<h2></h2>')
        .text(minder.getLang('ui.menu.new.header'))
        .appendTo($panel);

    // 模板列表容器
    var $ul = $('<ul></ul>')
        .addClass('new-file-template-select')
        .appendTo($panel);

    // 模板容器
    var $li;

    var templates = KityMinder.getTemplateList();

    for (var name in templates) {
        $li = $('<li></li>')
            .addClass('template-item')
            .addClass(name)
            .data('template', name)
            .append('<a>' + minder.getLang('template')[name] + '</a>')
            .appendTo($ul);
    }

    $ul.delegate('.template-item', 'click', function(e) {
        var template = $(e.target).data('template');
        minder.importData({
            template: template,
            version: KityMinder.version,
            data: {
                text: minder.getLang('template')[template]
            }
        });
        minder.execCommand('camera', minder.getRoot());
        $menu.removeClass('show');
    });

    var ret = {};

    eve.setup(ret);

    return ret;
});