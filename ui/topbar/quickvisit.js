/**
 * @fileOverview
 *
 * 快速访问区域
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('topbar/quickvisit', function (minder) {

    function btn(name) {
        return $('<a class="quick-visit-button"></a>')
            .text(minder.getLang('ui.quickvisit.' + name))
            .attr('title', minder.getLang('ui.quickvisit.' + name))
            .addClass(name)
            .appendTo('#panel');
    }

    var $new = btn('new'),
        $save = btn('save'),
        $share = btn('share'),
        $feedback = btn('feedback');

    minder.on('uiready', function quickVisit() {

        $('#panel #search').after($feedback);

        function quickNew() {
            var $doc = minder.getUI('doc');
            if (!$doc.checkSaved()) return;
            $doc.load({
                content: {
                    template: 'default',
                    version: KityMinder.version,
                    data: {
                        text: minder.getLang('maintopic')
                    }
                },
                saved: true
            });
        }

        function quickSave() {
            minder.getUI('menu/save/netdisk').quickSave();
        }

        function quickShare() {
            var $menu = minder.getUI('menu/menu');
            $menu.$tabs.select(3);
            $menu.show();
        }

        function quickFeedback() {
            var $menu = minder.getUI('menu/menu');
            $menu.$tabs.select(5);
            $menu.show();
        }

        $new.click(quickNew);
        $save.click(quickSave);
        $share.click(quickShare);
        $feedback.click(quickFeedback);

        minder.addShortcut('ctrl+alt+n', quickNew);
        minder.addShortcut('ctrl+s', quickSave);
        minder.addShortcut('ctrl+alt+s', quickShare);
        minder.addShortcut('ctrl+shift+s', function() {
            var $menu = minder.getUI('menu/menu');
            $menu.$tabs.select(2);
            $menu.show();
        });
        minder.addShortcut('f1', quickFeedback);

    });
});