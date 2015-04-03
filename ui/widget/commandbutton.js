/**
 * @fileOverview
 *
 * 生成绑定到某个命令的按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('widget/commandbutton', function(minder) {

    return {

        generate: function(command, onclick) {
            var $button = new FUI.Button({
                label: minder.getLang('ui.command.' + command) || minder.getLang('ui.' + command),
                text: minder.getLang('ui.command.' + command) || minder.getLang('ui.' + command),
                className: ['command-widget', 'command-button', command]
            });

            $button.bindExecution('click', onclick || function() {
                minder.execCommand(command);
            });

            $button.bindCommandState(minder, command);

            return $button;
        }
    };
});