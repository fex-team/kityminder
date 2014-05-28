KM.registerToolbarUI('fontfamily fontsize', function (name) {

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions(name) || [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;

    if (options.items.length == 0) {
        return null;
    }
    switch (name) {



    case 'fontfamily':
        options = transForFontfamily(options);
        break;

    case 'fontsize':
        options = transForFontsize(options);
        break;

    }

    //实例化
    $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
    comboboxWidget = $combox.kmui();

    comboboxWidget.on('comboboxselect', function (evt, res) {
        me.execCommand(name, res.value);
    }).on("beforeshow", function () {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
    });


    //状态反射
    this.on('interactchange', function () {
        var state = this.queryCommandState(name),
            value = this.queryCommandValue(name);
        //设置按钮状态
        comboboxWidget.button().kmui().disabled(state == -1).active(state == 1);

        if (value) {
            //设置label
            value = value.replace(/['"]/g, '').toLowerCase().split(/['|"]?\s*,\s*[\1]?/);
            comboboxWidget.selectItemByLabel(value);
        }
    });

    return comboboxWidget.button().addClass('kmui-combobox');

    //字体参数转换
    function transForFontfamily(options) {

        var temp = null,
            tempItems = [];

        for (var i = 0, len = options.items.length; i < len; i++) {

            temp = options.items[i].val;
            tempItems.push(temp.split(/\s*,\s*/)[0]);
            options.itemStyles.push('font-family: ' + temp);
            options.value.push(temp);
            options.autowidthitem.push($.wordCountAdaptive(tempItems[i]));

        }

        options.items = tempItems;

        return options;

    }

    //字体大小参数转换
    function transForFontsize(options) {

        var temp = null,
            tempItems = [];

        options.itemStyles = [];
        options.value = [];

        for (var i = 0, len = options.items.length; i < len; i++) {

            temp = options.items[i];
            tempItems.push(temp);
            options.itemStyles.push('font-size: ' + temp + 'px; height:' + (temp + 2) + 'px; line-height: ' + (temp + 2) + 'px');
        }

        options.value = options.items;
        options.items = tempItems;
        options.autoRecord = false;

        return options;

    }

});