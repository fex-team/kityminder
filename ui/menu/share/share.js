/**
 * @fileOverview
 *
 * 分享功能交互
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/share/share', function(minder) {
    var $share_menu = minder.getUI('menu/menu').createSubMenu('share');
    var $create_menu = $($share_menu.createSub('createshare'));
    var $manage_menu = $($share_menu.createSub('manageshare'));
    var $doc = minder.getUI('doc');
    var notice = minder.getUI('widget/notice');

    var BACKEND_URL = 'http://naotu.baidu.com/share.php';

    var currentShare = null;
    var shareList = [];

    renderCreatePanel().then(bindCreatePanelEvent);
    renderManagePanel();

    var shareListLoaded = loadShareList();

    shareListLoaded.then(renderShareList);
    shareListLoaded.then(bindManageActions);

    minder.on('uiready', function() {
        minder.getUI('topbar/user').requireLogin($manage_menu);
    });

    $doc.on('docload', function(doc) {
        if (doc.source != 'netdisk') {
            currentShare = null;
            $('#public-share .share-body', $create_menu).hide();
            setShareType('none');
        }
        var shared = getShareByPath(doc.path);
        if (shared) {
            setCurrentShare(shared);
        }
    });

    $doc.on('docsave', function(doc) {
        if (doc.source != 'netdisk') return;
        var shared = getShareByPath(doc.path);

        if (shared) {
            fio.user.check().then(function(user) {
                $.pajax({
                    url: BACKEND_URL,
                    type: 'POST',
                    data: {
                        action: 'update',
                        ak: user.access_token,
                        id: shared.id || shared.shareMinder.id,
                        record: doc.json
                    }
                }).then(function() {
                    notice.info(minder.getLang('ui.share_sync_success', doc.title));
                })['catch'](function(e) {
                    notice.error('err_share_sync_failed', e);
                });
            });
        }
    });

    function loadShareFile() {

        var pattern = /(?:shareId|share_id)=(\w+)([&#]|$)/;
        var match = pattern.exec(window.location) || pattern.exec(document.referrer);
        
        if (!match) return Promise.resolve(null);

        var shareId = match[1];

        $(minder.getRenderTarget()).addClass('loading');

        shareListLoaded.then(function(list) {
            for (var i = 0; i < list.length; i++) {
                var id = list[i].id || list[i].shareMinder.id;
                if (id == shareId && list[i].path) {
                    return loadOriginFile(list[i]);
                }
            }
            return loadShare(shareId);

        });

    }

    function loadOriginFile(share) {

        var $netdisk = minder.getUI('menu/open/netdisk');
        notice.info(minder.getLang('ui.load_share_for_edit', share.title));
        return $netdisk.open(share.path, function() {
            // 网盘加载失败
            return loadShare(share);
        });
    }

    function loadShare(shareId) {

        function renderShareData(data) {

            if (data.error) {
                notice.error('err_share_data', data.error);
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
            $container.removeClass('loading');
        });
    }

    function getShareByPath(path) {
        if (!path || !shareList) return null;

        var i = shareList.length;
        while (i--) {
            if (shareList[i].path == path) return shareList[i];
        }
        return null;
    }

    function setCurrentShare(share) {
        currentShare = share;
        renderPublicShare(share);
    }

    function renderCreatePanel() {
        // render template
        return $.pajax({ url: 'static/pages/createshare.html' }).then(function(html) {
            /* global jhtmls: true */
            var render = jhtmls.render(html);
            $create_menu.html(render({
                lang: minder.getLang('ui'),
                minder: minder
            }));
            setTimeout(zeroCopy, 10);
            return $create_menu;
        });
    }

    function renderManagePanel() {
        $manage_menu.append($('<h2>')
            .text(minder.getLang('ui.manage_share'))
            .attr('id', 'manage-share-header'));
    }

    function bindCreatePanelEvent($panel) {
        $panel.delegate('input[name=sharetype]', 'click', function(e) {
            var actions = {
                'none': removeCurrentShare,
                'public': createPublicShare
            };
            actions[e.target.value]();
        });

        $panel.delegate('input#share-url', 'dblclick', function() {
            this.select();
        });

        $panel.delegate('#copy-share-url', 'click', function() {
            if (kity.Browser.safari && kity.Browser.safari < 8) {
                var input = $('#share-url');
                input.focus();
                input.select();
                window.alert(minder.getLang('ui.clipboardunsupported'));
            }
        });
    }

    function bindManageActions() {
        $manage_menu.delegate('.share-item a', 'click', function(e) {
            var $target = $(e.target);
            var $li = $target.closest('.share-item');
            var share = $li.data('share');

            switch (true) {
                case $target.hasClass('view-action'):
                    window.open(buildShareUrl(share.id || share.shareMinder.id), '_blank');
                    return;

                case $target.hasClass('remove-action'):

                    $li.addClass('loading');

                    removeShare(share).then(function(result) {

                        if (result && result.deleted) {
                            shareList.splice(shareList.indexOf(share), 1);
                            $li.slideUp(function() {
                                $li.remove();
                            });
                            if (share == currentShare) {
                                removeCurrentShareSelect();
                            }
                        }

                    }).then(function() {

                        $li.removeClass('loading');

                    });

                    return;

                case $target.hasClass('edit-action'):
                    loadOriginFile(share);
                    return;
            }
        });
    }

    function removeShare(share) {
        return fio.user.check().then(function(user) {
            return $.pajax(BACKEND_URL, {

                type: 'POST',
                data: {
                    action: 'remove',
                    ak: user && user.access_token,
                    id: share.id || share.shareMinder.id
                },
                dataType: 'json'

            })['catch'](function(e) {
                var notice = minder.getUI('widget/notice');
                notice.error('err_remove_share', e);
            });
        });
    }

    function removeCurrentShare() {
        if (!currentShare) return;

        $create_menu.addClass('loading');

        return removeShare(currentShare).then(function(result) {
            if (result && result.deleted) {
                removeCurrentShareSelect();
            }
            $create_menu.removeClass('loading');
        });
    }

    function removeCurrentShareSelect() {
        var $sbody = $('#public-share .share-body', $create_menu);
        $sbody.hide();

        if (currentShare.$listItem) {
            currentShare.$listItem.remove();
        }
        currentShare = null;
        setShareType('none');
    }

    function uuid() {
        // 最多使用 1e7，否则 IE toString() 会出来指数表示法
        var timeLead = 1e6;
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

                var notice = minder.getUI('widget/notice');
                notice.error('err_create_share', e);

            });
        })

        .then(function(shared) {
            if (shared) {
                setCurrentShare(shared);
                shareListLoaded.then(function() {
                    shareList.unshift(shared);
                    $('#manage-share-list').prepend(currentShare.$listItem = buildShareItem(shared));
                });
            }
            $create_menu.removeClass('loading');
        });
    }

    function buildShareUrl(id) {

        var baseUrl = /^(.*?)(\?|\#|$)/.exec(window.location.href)[1];

        baseUrl = baseUrl.split('edit.html')[0];

        return baseUrl + 'viewshare.html?shareId=' + id;
    }

    function setShareType(value) {

        $('#share-select input[name=sharetype][value=' + value + ']', $create_menu)
            .prop('checked', true);
    }

    function renderPublicShare(shared) {
        var $sbody = $('#public-share .share-body', $create_menu);

        var shareUrl = buildShareUrl(shared.id || shared.shareMinder.id);

        $('#share-url', $sbody).val(shareUrl)[0].select();

        // qr code
        var $qrcontainer = $sbody.find('.share-qr-code').empty();

        new window.QRCode($qrcontainer[0], {
            text: shareUrl,
            width: 128,
            height: 128,
            correctLevel : window.QRCode.CorrectLevel.M
        });
        
        var shareConfig = window._bd_share_config && window._bd_share_config.common,
            resetShare = window._bd_share_main && window._bd_share_main.init;

        if (shareConfig && resetShare) {
            shareConfig.bdTitle = shareConfig.bdText = minder.getMinderTitle();
            shareConfig.bdDesc = shareConfig.bdText = minder.getLang('ui.sns_share_text', minder.getMinderTitle(), shareUrl);
            shareConfig.bdUrl = shareUrl;
            resetShare();
        }
        setShareType('public');

        $sbody.show();
    }

    function loadShareList() {

        return fio.user.check().then(function(user) {
            if (!user) return;
            return $.pajax(BACKEND_URL, {

                type: 'GET',

                data: {
                    action: 'list',
                    ak: user && user.access_token
                },

                dataType: 'json'

            }).then(function(result) {

                return (shareList = result.list || []);

            });
        });
    }

    function renderShareList(list) {
        var frdTime = minder.getUI('widget/friendlytimespan');
        var $list = $('<ul>')
            .attr('id', 'manage-share-list')
            .appendTo($manage_menu);
        if (!list) return;
        list.forEach(function(share) {
            $list.append(buildShareItem(share));
        });
    }

    function buildShareItem(share) {
        var $li = $('<li>')
            .addClass('share-item')
            .data('share', share);

        $('<span>')
            .addClass('title')
            .text(share.title)
            .appendTo($li);

        $('<span>')
            .addClass('url')
            .text(share.path ?
                share.path.replace('/apps/kityminder', minder.getLang('ui.mydocument')) :
                buildShareUrl(share.id || share.shareMinder.id))
            .appendTo($li);

        if (share.ctime) {
            $('<span>')
                .addClass('ctime')
                .displayFriendlyTime(+share.ctime)
                .appendTo($li);
        }

        $('<a>')
            .addClass('remove-action')
            .text(minder.getLang('ui.share_remove_action'))
            .attr('title', minder.getLang('ui.share_remove_action'))
            .appendTo($li);

        $('<a>')
            .addClass('view-action')
            .text(minder.getLang('ui.share_view_action'))
            .attr('title', minder.getLang('ui.share_view_action'))
            .appendTo($li);

        if (share.path)
            $('<a>')
                .addClass('edit-action')
                .text(minder.getLang('ui.share_edit_action'))
                .attr('title', minder.getLang('ui.share_edit_action'))
                .appendTo($li);

        return $li;
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

        var $copy_url_btn = $('#copy-share-url', $create_menu);

        if (window.ZeroClipboard) {
            ZeroClipboard.config({
                swfPath: 'lib/ZeroClipboard.swf',
                hoverClass: 'hover',
                activeClass: 'active'
            });
            var clip = new window.ZeroClipboard($copy_url_btn);
            clip.on('ready', function () {
                clip.on('aftercopy', function() {
                    $copy_url_btn.text(minder.getLang('ui.copied')).attr('disabled', 'disabled');
                    setTimeout(function() {
                        $copy_url_btn
                            .text(minder.getLang('ui.copy'))
                            .removeAttr('disabled');
                    }, 3000);
                });
            });
        }
    }

    return {
        $menu: $share_menu,
        loadShareFile: loadShareFile
    };
});