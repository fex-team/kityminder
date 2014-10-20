/**
 * @fileOverview
 *
 * 往右布局结构模板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerTemplate('right', {

    getLayout: function(node) {
        return node.getData('layout') || 'right';
    },

    getConnect: function(node) {
        if (node.getLevel() == 1) return 'arc';
        return 'bezier';
    }
});