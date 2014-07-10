KityMinder.registerTemplate('structure', {

    getLayout: function(node) {
        return 'bottom';
    }
});

KityMinder.registerTemplate('filetree', {

    getLayout: function(node) {
        if (node.getData('layout')) return node.getData('layout');
        if (node.isRoot()) return 'bottom';

        return 'filetree';
    }
});