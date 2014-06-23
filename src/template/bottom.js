KityMinder.registerTemplate('bottom', {

    getLayout: function(node) {

        if (node.getData('layout')) return node.getData('layout');
        if (node.isRoot()) return 'bottom';

        return 'filetree';
    },

    getTheme: function(node) {
        return node ? (node.isRoot() ? 'bottom' : 'filetree') : 'default';
    }
});