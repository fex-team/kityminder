KityMinder.registerUI('commandinputmenu', function(minder) {

    function generate(command, menuList) {

        var $menu = new FUI.InputMenu({
            menu: {
                items: menuList
            },
            input: {
                placeholder: minder.getLang('ui.' + command),
            },
            className: ['command-widget', 'command-inputmenu', command]
        });


        var interactFlag = false;

        $menu.bindCommandState(minder, command, function(value) {
            interactFlag = true;
            if (!$menu.selectByValue(value)) {
                $menu.clearSelect();
            }
            interactFlag = false;
        });

        var lastIndex = -1;
        $menu.on('select', function(e, info) {
            if (interactFlag) return;
            if (~info.index) {
                minder.execCommand(command, info.value);
            } else {
                $menu.select(lastIndex);
            }
            lastIndex = info.index;
        });

        return $menu;
    }

    return {
        generate: generate
    };
});