/**
 * @fileOverview
 *
 * 生成与指定命令绑定的下拉选框
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('widget/commandselectmenu', function(minder) {
    function mapValueWidget(command, valueList) {
        return valueList.map(function(value) {
            var text = minder.getLang([command, value].join('.')) || value;
            return {
                clazz: 'Button',
                label: text,
                text: text,
                value: value,
                className: [command, value].join(' ')
            };
        });
    }

    function generate(command, valueList, column) {

        var $selectMenu = new FUI.SelectMenu({
            widgets: typeof(valueList[0]) == 'object' ? valueList : mapValueWidget(command, valueList),
            className: ['command-widget', 'command-selectmenu', command].join(' '),
            column: column || 3
        });

        $selectMenu.bindExecution('change', function() {
            minder.execCommand(command, $selectMenu.getValue());
        });

        $selectMenu.bindCommandState(minder, command, function(value) {
            if (value !== undefined) this.selectByValue(value);
        });

        return $selectMenu;
    }

    return {
        generate: generate
    };
});