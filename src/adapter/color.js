KM.registerToolbarUI('forecolor', function (name) {
    function getCurrentColor() {
        return $colorLabel.css('background-color');
    }

    var me = this,
        $colorPickerWidget = null,
        $colorLabel = null,
        $btn = null;

    this.on('interactchange', function () {
        var state = this.queryCommandState(name);
        $btn.kmui().disabled(state == -1).active(state == 1);
    });

    $btn = $.kmuicolorsplitbutton({
        icon: name,
        caret: true,
        name: name,
        title: this.getLang('tooltips')[name] || '',
        click: function () {
            var color = kity.Color.parse(getCurrentColor()).toHEX();
            if (color != '#000000') {
                me.execCommand(name, color);
            }
        }
    });

    $colorLabel = $btn.kmui().colorLabel();

    $colorPickerWidget = $.kmuicolorpicker({
        name: name,
        lang_clearColor: me.getLang('popupcolor')['clearColor'] || '',
        lang_themeColor: me.getLang('popupcolor')['themeColor'] || '',
        lang_standardColor: me.getLang('popupcolor')['standardColor'] || ''
    }).on('pickcolor', function (evt, color) {
        window.setTimeout(function () {
            $colorLabel.css("backgroundColor", color);
            me.execCommand(name, color);
        }, 0);
    }).on('show', function () {
        KM.setActiveWidget($colorPickerWidget.kmui().root());
    }).css('zIndex', me.getOptions('zIndex') + 1);

    $btn.kmui().on('arrowclick', function () {
        if (!$colorPickerWidget.parent().length) {
            me.$container.find('.kmui-dialog-container').append($colorPickerWidget);
        }
        $colorPickerWidget.kmui().show($btn, {
            caretDir: "down",
            offsetTop: -5,
            offsetLeft: 8,
            caretLeft: 11,
            caretTop: -8
        });
    }).register('click', $btn, function () {
        $colorPickerWidget.kmui().hide()
    });

    return $btn;

});