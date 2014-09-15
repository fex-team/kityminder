/**
 * @fileOverview
 *
 * 添加快捷键支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

/**
 * 计算包含 meta 键的 keycode
 *
 * @param  {String|KeyEvent} unknown
 */
function getMetaKeyCode(unknown) {
    var CTRL_MASK = 0x1000;
    var ALT_MASK = 0x2000;
    var SHIFT_MASK = 0x4000;
    var metaKeyCode = 0;

    if (typeof(unknown) == 'string') {
        // unknown as string
        unknown.toLowerCase().split(/\+\s*/).forEach(function(name) {
            switch(name) {
                case 'ctrl':
                case 'cmd':
                    metaKeyCode |= CTRL_MASK;
                    break;
                case 'alt':
                    metaKeyCode |= ALT_MASK;
                    break;
                case 'shift':
                    metaKeyCode |= SHIFT_MASK;
                    break;
                default:
                    metaKeyCode |= keymap[name];
            }
        });
    } else {
        // unknown as key event
        if (unknown.ctrlKey || unknown.metaKey) {
            metaKeyCode |= CTRL_MASK;
        }
        if (unknown.altKey) {
            metaKeyCode |= ALT_MASK;
        }
        if (unknown.shiftKey) {
            metaKeyCode |= SHIFT_MASK;
        }
        metaKeyCode |= unknown.keyCode;
    }

    return metaKeyCode;
}
kity.extendClass(MinderEvent, {
    isShortcutKey: function(keyCombine) {
        var keyEvent = this.originEvent;
        if (!keyEvent) return false;

        return getMetaKeyCode(keyCombine) == getMetaKeyCode(keyEvent);
    }
});

kity.extendClass(Minder, {

    _initShortcutKey: function() {
        this._bindShortcutKeys();
    },
    
    _bindShortcutKeys: function() {
        var map = this._shortcutKeys = {};
        var has = 'hasOwnProperty';
        this.on('keydown', function(e) {
            for (var keys in map) {
                if (!map[has](keys)) break;
                if (e.isShortcutKey(keys)) {
                    map[keys]();
                    e.preventDefault();
                }
            }
        });
    },
    
    addShortcut: function(keys, fn) {
        var binds = this._shortcutKeys;
        keys.split(/\|\s*/).forEach(function(combine) {
            binds[combine] = fn;
        });
    },

    addCommandShortcutKeys: function(cmd, keys) {
        var binds = this._commandShortcutKeys || (this._commandShortcutKeys = {});
        var obj = {},
            km = this;
        if (keys) {
            obj[cmd] = keys;
        } else {
            obj = cmd;
        }

        var minder = this;

        utils.each(obj, function(command, keys) {

            binds[command] = keys;

            minder.addShortcut(keys, function execCommandByShortcut() {
                if (minder.queryCommandState(command) === 0) {
                    minder.execCommand(command);
                }
            });
        });
    },

    getCommandShortcutKey: function(cmd) {
        var binds = this._commandShortcutKeys;
        return binds && binds[cmd] || null;
    }
});