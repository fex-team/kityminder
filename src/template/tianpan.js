/**
 * @fileOverview
 *
 * 天盘模板
 *
 * @author: along
 * @copyright: bpd729@163.com, 2015
 */

KityMinder.registerTemplate('tianpan', {

    getLayout: function(node) {

        if (node.getData('layout')) return node.getData('layout');

        var level = node.getLevel();

        // 根节点
        if (level === 0) {
            return 'tianpan';
        }

        // 一级节点
        if (level === 1) {
            return 'tianpan';
//            return node.getLayoutPointPreview().x > 0 ? 'right': 'left';
        }

        return node.parent.getLayout();
    },

    getConnect: function(node) {
        return null;
        //if (node.getLevel() == 1) return 'arc';
        //return 'arc';
    }
});