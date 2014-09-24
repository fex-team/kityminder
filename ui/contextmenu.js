/**
 * @fileOverview
 *
 *
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('contextmenu', function(minder) {
    var mac = kity.Browser.mac;

    function camel(word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    }

    var $menu = $('<ul>')
        .addClass('km-context-menu fui-popup-menu')
        .appendTo('#content-wrapper');

    $menu.delegate('li', 'click', function(e, info) {
        var item = $(e.target).closest('li').data('menu');
        if (item.command) {
            minder.execCommand(item.command);
        }
    });

    $('#content-wrapper').on('contextmenu', function(e) {
        e.preventDefault();
    });

    $('#content-wrapper').on('click', function(e) {
        $menu.hide();
    });

    minder.on('mouseup', function(e) {
        //e.preventDefault();

        if (minder.getStatus() == 'hand' || !e.isRightMB()) return;

        e = e.originEvent;

        $menu.empty();

        var ctxmenu = minder.getContextMenu();

        var lastDivider = true;
        ctxmenu.forEach(function(item) {
            if (item.command && minder.queryCommandState(item.command) === 0) {

                var label = minder.getLang('ui.command.' + item.command);

                var $li = $('<li>')
                    .addClass('fui-item')
                    .data('menu', item)
                    .appendTo($menu);

                var shortcuts = minder.getCommandShortcutKey(item.command);
                if (shortcuts) {
                    shortcuts.split('|').forEach(function(shortcut) {
                        var $shortcut = $('<span>').addClass('shortcut').appendTo($li);
                        shortcut.split('+').forEach(function(key) {
                            var parts = key.split('::');
                            key = parts.length > 1 ? parts[1] : parts[0];
                            $('<span>').addClass('shortcut-key ' + key.toLowerCase())
                                .text(camel(key))
                                .appendTo($shortcut);
                        });
                        if (mac) $shortcut.addClass('mac');
                    });
                }

                $li.append($('<div>').text(label).addClass('menu-label'));

                lastDivider = false;
            }

            if (item.divider && !lastDivider) {
                $('<li>').addClass('divider').appendTo($menu);
                lastDivider = true;
            }
        });

        if (ctxmenu.length) {

            $menu.show();

            var x = e.pageX,
                y = e.pageY,
                width = $menu.outerWidth(),
                height = $menu.outerHeight(),
                clientWidth = document.body.clientWidth,
                clientHeight = document.body.clientHeight;

            if (x + width > clientWidth) x -= width;
            if (y + height > clientHeight) y -= height;

            $menu.offset({
                left: x,
                top: y
            });
        }
    });
});