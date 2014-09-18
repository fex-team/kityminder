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

    var BACKEND_URL = 'http://naotu.baidu.com/share.php';

    var currentShare = null;
    var shareList = [];

    renderCreatePanel().then(bindCreatePanelEvent);
    renderManagePanel();
    var shareListLoaded = loadShareList().then(bindManageActions);

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
                $.pajax(BACKEND_URL, {
                    type: 'POST',
                    data: {
                        action: 'update',
                        ak: user.access_token,
                        id: shared.id || shared.shareMinder.id,
                        record: doc.json
                    }
                });
            });
        }
    });

    function getShareByPath(path) {
        if (!path) return null;

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
        return $.pajax('static/pages/createshare.html').then(function(html) {
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
                    var $netdisk = minder.getUI('menu/open/netdisk');
                    $netdisk.open(share.path);

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

                window.alert(minder.getLang('remove_share_failed', e.message));

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

        baseUrl = baseUrl.split('index.html')[0];

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

        var shareConfig = window._bd_share_config.common,
            resetShare = window._bd_share_main.init;

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
            $.pajax(BACKEND_URL, {

                type: 'GET',

                data: {
                    action: 'list',
                    ak: user && user.access_token
                },

                dataType: 'json'

            }).then(function(result) {

                return (shareList = result.list || null);

            }).then(renderShareList);
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
        ZeroClipboard.setDefaults({
            moviePath: 'lib/ZeroClipboard.swf'
        });

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