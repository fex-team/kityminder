KityMinder.registerUI('history', ['commandbutton'], function(minder, $commandbutton) {
    var ret = {};

    ['undo', 'redo'].forEach(function(command) {
        ret[command] = $commandbutton.generate(command).appendTo(document.getElementById('panel'));
    });

    return ret;
});