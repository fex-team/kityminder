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
    var $doc = minder.getUI('doc');
    var ret = minder.getUI('eve').setup({});

    var $panel = $menu.createSub('new');

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

        if (!$doc.checkSaved()) return;

        var template = $(e.target).data('template');
        $doc.load({
            content: {
                template: template,
                version: KityMinder.version,
                data: {
                    text: minder.getLang('template')[template]
                }
            },
            protocol: null,
            saved: true
        });
        $menu.hide();
    });

    return ret;
});