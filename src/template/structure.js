/**
 * @fileOverview
 *
 * 组织结构图模板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerTemplate('structure', {

    getLayout: function(node) {
        return node.getData('layout') || 'bottom';
    },

    getConnect: function(node) {
        return 'poly';
    }
});