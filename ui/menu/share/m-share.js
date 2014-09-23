/**
 * @fileOverview
 *
 * 查看分享文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/share/m-share', function (minder) {
    var $doc = minder.getUI('doc');

    function loadShareDoc() {

        var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
        var match = pattern.exec(window.location) || pattern.exec(document.referrer);

        if (!match) return Promise.resolve(null);

        var shareId = match[1];

        function renderShareData(data) {

            if (data.error) {
                window.alert(data.error);
                window.location.href = 'index.html';
                return;
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
                $title.setTitle('[分享的] ' + $title.getTitle());
            });
        }

        $('#kityminder').addClass('loading');
        return $.pajax({

            url: 'http://naotu.baidu.com/share.php', //'http://naotu.baidu.com/mongo.php',

            data: {
                action: 'find',
                id: shareId
            },

            dataType: 'json'

        }).then(renderShareData)['catch'](function(e) {

            window.alert('请求分享文件失败，请重试！');

        }).then(function() {

            $(minder.getRenderTarget()).removeClass('loading');
            minder.execCommand('hand');
            $('#kityminder').removeClass('loading');

        });
    }

    minder.on('dblclick', function() {
        minder.execCommand('camera', minder.getRoot(), 500);
    });

    return {
        ready: loadShareDoc()
    };

});