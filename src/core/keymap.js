var keymap = KityMinder.keymap = (function(origin) {
    var ret = {};
    for (var key in origin) {
        if (origin.hasOwnProperty(key)) {
            ret[key] = origin[key];
            ret[key.toLowerCase()] = origin[key];
        }
    }
    return ret;
})({
    'Backspace': 8,
    'Tab': 9,
    'Enter': 13,

    'Shift': 16,
    'Control': 17,
    'Alt': 18,
    'CapsLock': 20,

    'Esc': 27,

    'Spacebar': 32,

    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,


    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,

    'direction':{
        37:1,
        38:1,
        39:1,
        40:1
    },
    'Insert': 45,

    'Del': 46,

    'NumLock': 144,

    'Cmd': 91,

    'F2': 113,
    'F3': 114,
    'F4': 115,

    '=': 187,
    '-': 189,

    'b': 66,
    'i': 73,
    //回退
    'z': 90,
    'y': 89,

    //复制粘贴
    'v': 86,
    'x': 88,
    'c': 67,

    's': 83,

    'n': 78,
    '/': 191,
    '.': 190,
    controlKeys:{
        16:1,
        17:1,
        18:1,
        20:1,
        91:1
    },
    'notContentChange': {
        13: 1,
        9: 1,

        33: 1,
        34: 1,
        35: 1,
        36: 1,

        16: 1,
        17: 1,
        18: 1,
        20: 1,
        91: 1,

        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,

        113: 1,
        114: 1,
        115: 1,
        144: 1,
        27: 1
    },

    'isSelectedNodeKey': {
        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        13: 1,
        9: 1
    },
    'a':65

});