KityMinder.registerUI('recent', ['mainmenu.open'], function(minder, $openmenu) {
    var storage = localStorage;
    var recent = storage.recentFiles;

    recent = recent ? JSON.decode(recent) : [];

    return {
        push: function(type, path) {
            recent.unshift({
                type: type,
                path: path,
                time: +new Date()
            });
        },
        load: function(index) {
            
        }
    };
});