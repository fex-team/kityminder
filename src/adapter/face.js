KM.registerToolbarUI('template theme', function(name) {

    var values = utils.keys(name == 'template' ? KM.getTemplateList() : KM.getThemeList());

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: values.map(function(value) {
                return me.getLang(name)[value];
            }),
            itemStyles: [],
            value: values,
            autowidthitem: [],
            enabledRecord: false
        },
        $combox = null;

    //实例化
    $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on('comboboxselect', function(evt, res) {
        me.execCommand(name, res.value);
    }).on('beforeshow', function() {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
    });
    var lastState, lastValue;
    //状态反射
    me.on('interactchange', function() {
        var state = this.queryCommandState(name),
            value = this.queryCommandValue(name);
        //设置按钮状态

        if (lastState != state)
            comboboxWidget.button().kmui().disabled(state == -1).active(state == 1);

        if (value && value != lastValue) {
            // 此处貌似性能很差，加入缓存
            comboboxWidget.selectItemByValue(value);
        }

        lastState = state;
        lastValue = value;

    });

    return comboboxWidget.button().addClass('kmui-combobox');
});