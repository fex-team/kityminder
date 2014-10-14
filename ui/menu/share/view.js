/**
 * @fileOverview
 *
 * 查看分享文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/share/view', function (minder) {
    var $menu = minder.getUI('menu/menu');
    var $save = minder.getUI('menu/save/save');
    var $doc = minder.getUI('doc');
    var notice = minder.getUI('widget/notice');
    var shareId;

    $menu.$tabs.select(0);
    $save.$tabs.select(0);

    minder.on('uiready', function() {
        var $quickvisit = minder.getUI('topbar/quickvisit');
        var $edit = $quickvisit.add('editshare', 'right');

        $edit.on('click', function() {
            if (shareId) window.open('edit.html?shareId=' + shareId);
        });

        $quickvisit.$new.remove();
        $quickvisit.$save.remove();
        $quickvisit.$share.remove();
    });

    function loadShareDoc() {

        var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
        var match = pattern.exec(window.location) || pattern.exec(document.referrer);
        
        if (!match) return Promise.resolve(null);

        shareId = match[1];

        function renderShareData(data) {

            if (data.error) {
                return notice.error('err_share_data', data.error);
            }

            var content = data.shareMinder.data;

            return $doc.load({

                source: 'share',
                content: content,
                protocol: 'json',
                saved: true,
                ownerId: data.uid,
                ownerName: data.uname

            }).then(function(doc) {
                var $title = minder.getUI('topbar/title');
                $title.setTitle('[分享的] ' + $title.getTitle() + ' (只读)');
            });
        }

        var $container = $(minder.getRenderTarget()).addClass('loading');

        return $.pajax({

            url: 'http://naotu.baidu.com/share.php',

            data: {
                action: 'find',
                id: shareId
            },

            dataType: 'json'

        }).then(renderShareData)['catch'](function(e) {

            notice.error('err_share_data', e);

        }).then(function() {

            minder.disable();
            minder.execCommand('hand', true);
            $container.removeClass('loading');

        });
    }

    return {
        ready: loadShareDoc()
    };
});