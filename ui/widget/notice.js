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

    $error.on('ok cancel', function(e) {
        if (error.resolve) error.resolve(e);
    });

    var $error_body = $($error.getBodyElement());

    var isBuilded = (function() {
        var scripts = [].slice.apply(document.getElementsByTagName('script'));
        var s, m;
        while( (s = scripts.pop()) ) {
            if ( (m = /kityminder.*\.min\.js/.exec(s.src))) return m[0];
        }
        return false;

    })();

    // concatMap: sperate files -> join file
    // minMap: join file -> min file
    var concatMap, minMap;
    function fixSourceSymbol($ta, $mask) {

        function fix() {
            var text = $ta.text();
            var pattern = new RegExp('at.+' + isBuilded + '.+\\:(\\d+)\\:(\\d+)\\)?', 'g');
            var match;

            $ta.text(text.replace(pattern, function(match, $1, $2) {
                var lookup = {line: +$1, column: +$2};
                var info = minMap.originalPositionFor(lookup);
                var name = info.name;
                lookup = {line: info.line, column: info.column};
                info = concatMap.originalPositionFor(lookup);
                name = name || '<Anonymous>';
                var replaced = 'at ' + name + ' (' + 
                    info.source.replace('../', '') + ':' + info.line + ':' + info.column + ')';
                if (replaced.indexOf('promise') != -1) {
                    replaced = 'at <async> Promise.' + name;
                }
                return replaced;
            }));
        }

        if (isBuilded) {

            if (concatMap) return fix();

            $mask.addClass('loading');

            setTimeout(function() {
                $mask.removeClass('loading');
            }, 5000);

            var script = document.createElement('script');
            script.onload = function() {
                Promise.all([

                    $.pajax({
                        url: isBuilded.replace('min.js', 'js.map'),
                        dataType: 'json'
                    }), 

                    $.pajax({
                        url: isBuilded.replace('.js', '.map'),
                        dataType: 'json'
                    })

                ]).then(function(files) {
                    concatMap = new window.sourceMap.SourceMapConsumer(files[0]);
                    minMap = new window.sourceMap.SourceMapConsumer(files[1]);
                    fix();
                    $mask.removeClass('loading');
                });
            };
            script.src = 'lib/source-map.min.js';
            document.head.appendChild(script);
        }
    }

    $error_body.delegate('.error-detail a.expander', 'click', function(e) {
        var $detail = $(e.target).closest('.error-detail').toggleClass('expanded');
        var showDetail = $detail.hasClass('expanded');

        memory.set('show-error-detail', showDetail);
    });

    function info(msg, warn, time) {

        if (!$notice.hasClass('show')) $notice.empty();

        clearTimeout(info.ttl2);

        if (warn) $notice.addClass('warn');
        else $notice.removeClass('warn');

        $notice.append('<p>' + msg + '</p>');
        $notice.addClass('show');

        clearTimeout(info.ttl);

        time = time || (warn ? 5000 : 3000);
        info.ttl = setTimeout(function() {
            $notice.removeClass('show');
            info.ttl2 = setTimeout(function() {
                $notice.empty();
            }, 1000);
        }, time);
    }

    function warn(msg) {
        info(msg, warn);
    }

    function descriptReason(e) {
        e = e || {};

        if (typeof(e) == 'string') {
            e = new Error(e);
        }

        if (e.getDetail) return e;

        // 文件访问错误
        if (typeof(fio) != 'undefined' && (e instanceof fio.FileRequestError)) {
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

            var $detailContent = $('<div>')
                    .addClass('error-detail-wrapper')
                    .appendTo($detail);

            var $textarea = $('<textarea>')
                    .attr('id', 'error-detail-content')
                    .text(e.getDetail())
                    .appendTo($detailContent);

            fixSourceSymbol($textarea, $detailContent);

            var $copy = $('<button>')
                    .addClass('copy-and-feedback')
                    .text(minder.getLang('ui.copy_and_feedback'))
                    .appendTo($detailContent);

            $copy.attr('data-clipboard-target', 'error-detail-content');

            zeroCopy($copy);

            if (memory.get('show-error-detail')) $detail.addClass('expanded');
        }

        $error.show();
        $error.getElement().style.top = '180px';

        return new Promise(function(resolve) {
            error.resolve = resolve;
        });
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