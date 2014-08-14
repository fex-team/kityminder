KityMinder.registerUI('commandbutton', function(minder) {
    return {
        generate: function(command, onclick) {
            var $button = new FUI.Button({
                label: minder.getLang('ui.' + command),
                text: minder.getLang('ui.' + command),
                className: ['command-widget', 'command-button', command]
            });

            $button.on('click', onclick || function() {
                minder.execCommand(command);
            });

            $button.bindCommandState(minder, command);

            return $button;
        }
    };
});