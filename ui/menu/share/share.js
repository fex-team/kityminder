/**
 * @fileOverview
 *
 * 分享功能交互
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/share/share', function(minder) {
    var $share_menu = minder.getUI('menu/menu').createSubMenu('share', true);
    var $create_menu = $($share_menu.createSub('createshare', true));
    var $manage_menu = $($share_menu.createSub('manageshare'));
    var $doc = minder.getUI('doc');

    var BACKEND_URL = 'http://127.0.0.1/naotu/mongo.php';

    var currentShare = null;
    var shareList = [];

    var panelReady = renderCreatePanel();

    panelReady.then(bindCreatePanelEvent);

    fio.user.on('login', loadShareList);
    fio.user.on('logout', clearShareList);

    function renderCreatePanel() {
        // render template
        return $.pajax('ui/menu/share/create.html').then(function(html) {
            /* global jhtmls: true */
            var render = jhtmls.render(html);
            $create_menu.html(render({
                lang: minder.getLang('ui'),
                minder: minder
            }));
            zeroCopy();
            return $create_menu;
        });
    }

    function bindCreatePanelEvent($panel) {
        $panel.delegate('input[name=sharetype]', 'click', function(e) {
            var actions = {
                'none': removeShare,
                'public': createPublicShare
            };
            actions[e.target.value]();
        });
    }

    function removeShare() {
        if (!currentShare) return;
        if (currentShare) {
            return $.pajax({

            });
        }
    }

    function uuid() {
        var timeLead = 1e9;
         return ((+new Date() * timeLead) + (Math.random() * --timeLead)).toString(36);
    }

    function createPublicShare(user) {
        if (currentShare) return;

        $create_menu.addClass('loading');

        return fio.user.check().then(function(user) {

            var record = {
                shareMinder: {
                    id: uuid(),
                    data: JSON.stringify(minder.exportJson())
                }
            };

            var currentDoc = $doc.current();

            if (currentDoc.source == 'netdisk') {
                record.path = currentDoc.path;
            }

            return $.pajax(BACKEND_URL, {

                type: 'POST',
                data: {
                    action: 'insert',
                    record: JSON.stringify(record),
                    ak: user && user.access_token
                },
                dataType: 'json'

            }).then(function(result) {

                if (result.error) {
                    throw new Error(result.error);
                }

                return result;

            })['catch'](function(e) {

                window.alert(minder.getLang('create_share_failed', e.message));

            });
        })

        .then(function(shared) {
            if (shared) {
                currentShare = shared;
                renderPublicShare(shared);
            }
            $create_menu.removeClass('loading');
        });
    }

    function renderPublicShare(shared) {
        var $sbody = $('#public-share .share-body', $create_menu);

        var baseUrl = /^(.*?)(\?|\#|$)/.exec(window.location.href)[1];
        var shareUrl = baseUrl + '?shareId=' + shared.shareMinder.id;

        $('#share-url', $sbody).val(shareUrl)[0].select();

        var shareConfig = window._bd_share_config.common,
            resetShare = window._bd_share_main.init;

        if (shareConfig && resetShare) {
            shareConfig.bdTitle = shareConfig.bdText = minder.getMinderTitle();
            shareConfig.bdDesc = shareConfig.bdText = minder.getLang('ui.sns_share_text', minder.getMinderTitle(), shareUrl);
            shareConfig.bdUrl = shareUrl;
            resetShare();
        }

        $sbody.show();
    }

    function loadShareList() {
        var user = fio.user.current();
        return $.pajax(BACKEND_URL, {

        });
    }

    function clearShareList() {
        shareList = [];
        
    }

    function shareRedirect() {
        var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
        var match = pattern.exec(window.location) || pattern.exec(document.referrer);

        if (match) {
            window.location.href = 'viewshare.html?shareId=' + match[1]; 
        }
    }

    function zeroCopy() {

        /* global ZeroClipboard:true */
        ZeroClipboard.setDefaults({ moviePath: 'lib/ZeroClipboard.swf' });

        var $copy_url_btn = $('#copy-share-url', $create_menu);

        if (window.ZeroClipboard) {
            var clip = new window.ZeroClipboard($copy_url_btn, {
                hoverClass: 'hover',
                activeClass: 'active'
            });
            clip.on('dataRequested', function(client, args) {
                $copy_url_btn.text(minder.getLang('ui.copied')).attr('disabled', 'disabled');
                setTimeout(function() {
                    $copy_url_btn
                        .text(minder.getLang('ui.copy'))
                        .removeAttr('disabled');
                }, 3000);
            });
        }
    }

    return $share_menu;
});