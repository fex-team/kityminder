/**
 * @fileOverview
 *
 * 文件夹模板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerTemplate('filetree', {

    getLayout: function(node) {
        if (node.getData('layout')) return node.getData('layout');
        if (node.isRoot()) return 'bottom';

        return 'filetree';
    },

    getConnect: function(node) {
        if (node.getLevel() == 1) {
            return 'poly';
        }
        return 'l';
    }
});