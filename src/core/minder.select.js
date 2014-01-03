// 选区管理
kity.extendClass( Minder, {
    getSelectedNodes: function () {
        return this._selectedNodes || ( this._selectedNodes = [] );
    },

    select: function ( nodes ) {
        var selection = this.getSelectedNodes();
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        for ( var i = 0; i < nodes.length; i++ ) {
            if ( selection.indexOf( nodes[ i ] ) === -1 ) {
                selection.push( nodes[ i ] );
            }
        }
        return this;
    },

    isNodeSelected: function ( node ) {
        return !!~this.getSelectedNodes().indexOf( node );
    },

    selectSingle: function ( node ) {
        return this.clearSelect().select( node );
    },

    toggleSelect: function ( nodes ) {
        var selection = this.getSelectedNodes();
        var needAdd = [],
            needRemove = [];
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        for ( var i = 0; i < nodes.length; i++ ) {
            if ( selection.indexOf( nodes[ i ] ) === -1 ) {
                needAdd.push( nodes[ i ] );
            } else {
                needRemove.push( nodes[ i ] );
            }
        }
        this.clearSelect( needRemove );
        this.select( needAdd );
    },

    clearSelect: function ( nodes ) {
        if ( !nodes ) {
            this._selectedNodes = [];
            return this;
        }
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        var originSelection = this.getSelectedNodes();
        var newSelection = [];
        for ( var i = 0; i < originSelection.length; i++ ) {
            if ( nodes.indexOf( originSelection[ i ] ) === -1 ) {
                newSelection.push( originSelection[ i ] );
            }
        }
        this._selectedNodes = newSelection;
        return this;
    }
} );