/**
 * @fileOverview
 *
 * 草稿箱功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/draft', function(minder) {
    var $menu = minder.getUI('menu/menu');
    var $open = minder.getUI('menu/open/open');
    var $loader = minder.getUI('widget/fileloader');

    var frdTime = minder.getUI('widget/friendlytimespan');

    var $doc = minder.getUI('doc');

    // 旧数据迁移
    if (localStorage.drafts) {
        var oldDrafts = JSON.parse(localStorage.drafts);
        var list = oldDrafts.map(function(draft) {
            var ret = {};
            ret.json = draft.data;
            ret.time = +new Date(draft.update);
            ret.title = JSON.parse(draft.data).data.text;
            return ret;
        });
        delete localStorage.drafts;
        localStorage.draft = JSON.stringify(list);
    }

    var draftList = minder.getUI('widget/locallist').use('draft');

    /* 网盘面板 */
    var $panel = $($open.createSub('draft')).addClass('draft-panel');

    /* 标题 */
    var $title = $('<h2></h2>')
        .text(minder.getLang('ui.menu.draftheader'))
        .appendTo($panel);

    var $clear = $('<button></button>')
        .addClass('clear-draft')
        .text(minder.getLang('ui.cleardraft'))
        .appendTo($panel);

    /* 最近文件列表容器 */
    var $ul = $('<ul></ul>')
        .addClass('draft-list')
        .appendTo($panel);

    var current = null,
        lastDoc = null;

    $ul.delegate('.draft-list-item', 'click', function(e) {

        if (!$doc.checkSaved()) return;

        var item = $(e.target).closest('.draft-list-item').data('item');

        var index = draftList.findIndex(function(finding) {
            return finding == item;
        });

        if (index > -1) {
            current = item;

            draftList.remove(index);
            draftList.unshift(current);

            lastDoc = {
                title: current.title,
                protocol: 'json',
                content: current.json,
                path: current.path,
                source: current.source,
                saved: false
            };

            $doc.load(lastDoc);
        }
        $menu.hide();
    });

    $clear.on('click', function() {
        if (!window.confirm(minder.getLang('ui.cleardraftconfirm'))) return;
        draftList.clear();
        current = null;
        renderList();
    });

    $doc.on('docsave', popDraft);
    $doc.on('docchange', pushDraft);

    renderList();

    function pushDraft(doc) {
        if (doc == lastDoc) {
            if (current) {
                draftList.remove(0);
            }
        } else {
            current = null;
        }
        lastDoc = doc;
        current = current || {};
        current.json = JSON.stringify(minder.exportJson());
        current.title = doc.title;
        current.time = +new Date();
        current.path = doc.path;
        current.source = doc.source;
        draftList.unshift(current);
        renderList();
    }

    function popDraft() {
        if (current) {
            draftList.remove(0);
            current = null;
        }
        renderList();
    }

    function renderList() {
        $ul.empty();

        draftList.forEach(function(item) {

            var $li = $('<li></li>')
                .addClass('draft-list-item')
                .data('item', item)
                .appendTo($ul);

            $('<h4></h4>')
                .addClass('draft-title')
                .text(item.title)
                .appendTo($li);

            $('<span></span>')
                .addClass('file-time')
                .displayFriendlyTime(item.time)
                .appendTo($li);
        });
    }

    return {
        hasDraft: function() {
            return draftList.length;
        },
        openLast: function() {
            $ul.find('.draft-list-item').eq(0).click();
        }
    };
});