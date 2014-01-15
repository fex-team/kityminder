// 选区管理
kity.extendClass( Minder, {
    _initSelection: function () {
        this._selectedNodes = [];
    },

    getSelectedNodes: function () {
        return this._selectedNodes.slice( 0 );
    },

    select: function ( nodes ) {
        var selection = this._selectedNodes;
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        for ( var i = 0; i < nodes.length; i++ ) {
            if ( selection.indexOf( nodes[ i ] ) === -1 ) {
                selection.push( nodes[ i ] );
                this.highlightNode( nodes[ i ] );
            }
        }
        return this;
    },
    highlightNode: function ( node ) {
        node.setData( "highlight", true );
        this.renderNode( node );
    },
    isNodeSelected: function ( node ) {
        return !!~this._selectedNodes.indexOf( node );
    },

    selectSingle: function ( node ) {
        return this.clearSelect().select( node );
    },

    toggleSelect: function ( nodes ) {
        var selection = this._selectedNodes;
        var needAdd = [],
            needRemove = [];
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        for ( var i = 0; i < nodes.length; i++ ) {
            if ( selection.indexOf( nodes[ i ] ) === -1 ) {
                needAdd.push( nodes[ i ] );
                this.highlightNode( nodes[ i ] );
            } else {
                needRemove.push( nodes[ i ] );
                this.unhighlightNode( nodes[ i ] );
            }
        }
        return this.clearSelect( needRemove ).select( needAdd );
    },

    clearSelect: function ( nodes ) {
        if ( !nodes ) {
            for ( var _i = 0; _i < this._selectedNodes.length; _i++ ) {
                this.unhighlightNode( this._selectedNodes[ _i ] );
            }
            this._selectedNodes = [];
            return this;
        }
        if ( false === nodes instanceof Array ) nodes = [ nodes ];
        var originSelection = this._selectedNodes;
        var newSelection = [];
        for ( var i = 0; i < originSelection.length; i++ ) {
            if ( nodes.indexOf( originSelection[ i ] ) === -1 ) {
                newSelection.push( originSelection[ i ] );
            }
        }
        this._selectedNodes = newSelection;
        return this;
    },
    unhighlightNode: function ( node ) {
        node.setData( "highlight", false );
        this.renderNode( node );
    }
} );