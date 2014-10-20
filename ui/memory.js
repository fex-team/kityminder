/**
 * @fileOverview
 *
 * UI 状态记忆
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('memory', function () {

    var ls = window.localStorage;
    var memory = ls.uiMemory ? JSON.parse(ls.uiMemory) : {};

    return {
        get: function(item) {
            return memory[item] || null;
        },

        set: function(item, value) {
            memory[item] = value;
            ls.uiMemory = JSON.stringify(memory);
        }
    };
});