/**
 * @fileOverview
 *
 * commandbuttonset.js 生成与指定命令绑定的按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('widget/commandbuttonset', function(minder) {
    function mapValueItem(command, valueList) {
        return valueList.map(function(value) {
            var text = minder.getLang([command, value].join('.')) || value;
            return {
                label: text,
                text: text,
                value: value,
                className: [command, value].join(' ')
            };
        });
    }

    function generate(command, valueList) {

        var $buttonset = new FUI.Buttonset({
            id: 'template-set',
            buttons: typeof(valueList[0]) == 'object' ? valueList : mapValueItem(command, valueList),
            className: ['command-widget', 'command-buttonset', command].join(' ')
        });


        $buttonset.bindExecution('change', function() {
            minder.execCommand(command, $buttonset.getValue());
        });

        $buttonset.bindCommandState(minder, command, function(value) {
            this.selectByValue(value);
        });

        return $buttonset;
    }

    return {
        generate: generate
    };
});