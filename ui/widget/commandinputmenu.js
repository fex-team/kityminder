/**
 * @fileOverview
 * 
 * 绑定到某个命令的下拉选框
 *
 */
KityMinder.registerUI('widget/commandinputmenu', function(minder) {

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


        $menu.bindCommandState(minder, command, function(value) {
            if (!$menu.selectByValue(value)) {
                $menu.clearSelect();
            }
        });

        var lastIndex = -1;
        $menu.bindExecution('select', function(e, info) {
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