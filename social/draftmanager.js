function DraftManager( minder ) {
    var current = null,
        localStorage = window.localStorage,
        drafts;

    init();

    function init() {
        drafts = localStorage.getItem( 'drafts' );
        drafts = drafts ? JSON.parse( drafts ) : [];
    }

    function store() {
        localStorage.setItem( 'drafts', JSON.stringify( drafts ) );
    }

    function create( path ) {
        current = {
            path: path || 'local/' + ( +new Date() )
        };
        drafts.unshift( current );
        save();
    }

    function open( index ) {
        current = drafts[ index ];
        if ( !current ) return false;

        // bring it first
        drafts.splice( index, 1 );
        drafts.unshift( current );

        store();
        return current;
    }

    function load() {
        if ( current ) {
            minder.importData( current.data, "json" );
        }
        return current;
    }

    function openByPath( path ) {
        for ( var i = 0; i < drafts.length; i++ ) {
            if ( drafts[ i ].path == path ) return open( i );
        }
        return false;
    }

    function save( path ) {
        if ( !current ) {
            create();
        } else {
            current.path = path || current.path;
            current.name = minder.getMinderTitle();
            current.data = minder.exportData( "json" );
            current.update = new Date();
            store();
        }
    }

    function list() {
        return drafts.slice();
    }

    function remove( remove_index ) {
        drafts.splice( remove_index, 1 );
        store();
    }

    function clear() {
        drafts.splice( 1 );
        store();
    }

    return {
        open: open,
        openByPath: openByPath,
        load: load,
        save: save,
        create: create,
        list: list,
        remove: remove,
        clear: clear
    };
}