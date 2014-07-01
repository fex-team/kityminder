KityMinder.registerTemplate('structure', {

    name: '组织结构图',

    getLayout: function(node) {

        if (node.getData('layout')) return node.getData('layout');
        if (node.isRoot()) return 'bottom';

        return 'filetree';
    }
});