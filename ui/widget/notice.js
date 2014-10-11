/**
 * @fileOverview
 *
 * 通知小组件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/notice', function (minder) {
    var errorMessage = minder.getLang('error_message');
    var memory = minder.getUI('memory');

    var $notice = $('<div>')
            .addClass('notice-widget')
            .appendTo('#kityminder');
    var $mask = $('<div>')
            .addClass('error-mask');

    var $error = new FUI.Dialog({
        width: 500,
        height: 'auto',
        prompt: true,
        caption: errorMessage.title,
        className: 'error-dialog'
    }).appendTo(document.getElementById('content-wrapper'));

    var $error_body = $($error.getBodyElement());

    $error_body.delegate('.error-detail a.expander', 'click', function(e) {
        var $detail = $(e.target).closest('.error-detail').toggleClass('expanded');
        memory.set('show-error-detail', $detail.hasClass('expanded'));
    });

    function info(msg, warn) {

        if (!$notice.hasClass('show')) $notice.empty();

        if (warn) $notice.addClass('warn');
        else $notice.removeClass('warn');

        $notice.append('<p>' + msg + '</p>');
        $notice.addClass('show');

        clearTimeout(info.ttl);
        info.ttl = setTimeout(function() {
           $notice.removeClass('show');
        }, warn ? 5000 : 3000);
    }

    function warn(msg) {
        info(msg, warn);
    }

    function descriptReason(e) {
        e = e || {};

        if (typeof(e) == 'string') {
            e = new Error(e);
        }

        // 文件访问错误
        if (e instanceof fio.FileRequestError) {
            if (!e.status) {
                e.description = errorMessage.err_network;
            } else {
                e.description = errorMessage.pcs_code[e.detail.error_code];
            }
            e.getDetail = function() {
                return JSON.stringify(e, null, 4);
            };
        } else if (e instanceof Error) {
            e.getDetail = function() {
                return e.stack;
            };
        }

        return e;
    }

    function error(name, e) {
        if (arguments.length == 1) {
            e = name;
            name = 'unknown';
        }
        $error_body.empty();

        e = descriptReason(e);

        var $content = $('<div>')
                .addClass('error-content')
                .appendTo($error_body);

        var $msg = $('<h3>')
                .text(errorMessage[name] || errorMessage.err_unknown)
                .appendTo($content);
        var $reason = $('<p>')
                .text(e.message || e.description || errorMessage.unknownreason)
                .appendTo($content);

        if (e.getDetail) {
            var $detail = $('<div>')
                    .addClass('error-detail')
                    .append($('<a class="expander"></a>').text(minder.getLang('ui.error_detail')))
                    .appendTo($error_body);
            var $textarea = $('<textarea>')
                    .attr('id', 'error-detail-content')
                    .text(e.getDetail())
                    .appendTo($detail);
            var $copy = $('<button>')
                    .addClass('copy-and-feedback')
                    .text(minder.getLang('ui.copy_and_feedback'))
                    .appendTo($detail);

            $copy.attr('data-clipboard-target', 'error-detail-content');

            zeroCopy($copy);

            if (memory.get('show-error-detail')) $detail.addClass('expanded');
        }

        $error.show();
        $error.getElement().style.top = '180px';
    }


    function zeroCopy($target) {

        /* global ZeroClipboard:true */

        if (window.ZeroClipboard) {
            ZeroClipboard.config({
                swfPath: 'lib/ZeroClipboard.swf',
                hoverClass: 'hover',
                activeClass: 'active'
            });
            var clip = new window.ZeroClipboard($target);
            clip.on('ready', function () {
                clip.on('aftercopy', function() {
                    $error.hide();
                    minder.getUI('topbar/quickvisit').quickFeedback();
                });
            });
        } else {
            $target.remove();
        }
    }

    return {
        info: info,
        error: error,
        warn: warn
    };

});