function DraftManager( minder ) {
    var current = null,
        localStorage = window.localStorage,
        drafts,
        MAX_SIZE = 15;

    init();

    function init() {
        drafts = localStorage.getItem( 'drafts' );
        drafts = drafts ? JSON.parse( drafts ) : [];
    }

    function store() {
        localStorage.setItem( 'drafts', JSON.stringify( drafts.slice( 0, MAX_SIZE ) ) );
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
            minder.importData( current.data, 'json' );
        }
        return current;
    }

    function getCurrent() {
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
            var data = minder.exportData( 'json' );
            current.sync = current.sync && (data == current.data);
            current.data = data;
            current.update = new Date();
            store();
        }
        return current;
    }

    function sync() {
        current.sync = true;
        store();
    }

    function list() {
        return drafts.slice( 0, 15 );
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
        clear: clear,
        getCurrent: getCurrent,
        sync: sync
    };
}