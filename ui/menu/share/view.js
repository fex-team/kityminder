/**
 * @fileOverview
 *
 * 查看分享文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/share/view', function (minder) {
    var $doc = minder.getUI('doc');
    var $save = minder.getUI('menu/save');
    var $download = minder.getUI('download');

    function loadShareDoc(results) {
        var user = results[0],
            $panel = results[1];

        var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
        var match = pattern.exec(window.location) || pattern.exec(document.referrer);
        
        if (!match) return Promise.resolve(null);

        var shareId = match[1];

        function renderShareData(data) {

            if (data.error) {
                return window.alert(data.error);
            }

            var content = data.shareMinder.data;

            return $doc.load({

                source: 'share',
                content: content,
                protocol: 'json',
                saved: false,
                ownerId: data.uid,
                ownerName: data.uname

            }).then(function(doc) {

                if (user) {
                    if (doc.ownerId == user.id) {

                    }
                }

                // 分享着不是当前用户
                if (doc.ownerId && doc.ownerId != (user && user.id)) {
                    $('#shared-tip', $panel).text(minder.getLang('ui.shared_tip', doc.ownerName));
                }
            });
        }

        return $.pajax({

            url: 'http://127.0.0.1/naotu/mongo.php', //'http://naotu.baidu.com/mongo.php',

            data: {
                action: 'find',
                id: shareId
            },

            dataType: 'json'

        }).then(renderShareData)['catch'](function(e) {

            window.alert('请求分享文件失败，请重试！');

        }).then(function() {

            $(minder.getRenderTarget()).removeClass('loading');

        });
    }
});