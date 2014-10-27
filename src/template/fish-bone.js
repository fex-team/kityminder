/**
 * @fileOverview
 *
 * 默认模板 - 鱼骨头模板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerTemplate('fish-bone', {

    getLayout: function(node) {

        if (node.getData('layout')) return node.getData('layout');

        var level = node.getLevel();

        // 根节点
        if (level === 0) {
            return 'fish-bone-master';
        }

        // 一级节点
        if (level === 1) {
            return 'filetree';
        }

        return node.parent.getLayout();
    },

    getConnect: function(node) {
        if (node.getLevel() == 1) return 'fish-bone-master';
        return 'under';
    }
});