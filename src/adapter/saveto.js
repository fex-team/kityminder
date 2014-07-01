KM.registerToolbarUI('saveto', function(name) {

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: [],
            itemStyles: [],
            value: [],
            autowidthitem: [],
            enabledRecord: false,
            enabledSelected: false
        },
        $combox = null,
        comboboxWidget = null;

    utils.each(KityMinder.getAllRegisteredProtocals(), function(k) {
        var p = KityMinder.findProtocal(k);
        if (p.encode) {
            var text = p.fileDescription + '（' + p.fileExtension + '）';
            options.value.push(k);
            options.items.push(text);
            options.autowidthitem.push($.wordCountAdaptive(text), true);
        }
    });


    //实例化
    $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
    comboboxWidget = $combox.kmui();

    function doProxyDownload(url, filename, type) {
        var content = url.split(',')[1];
        var $form = $('<form></form>').attr({
            'action': 'http://172.22.73.36/naotu/download.php',
            'method': 'POST'
        });

        var $content = $('<input />').attr({
            name: 'content',
            type: 'hidden',
            value: decodeURIComponent(content)
        }).appendTo($form);

        var $type = $('<input />').attr({
            name: 'type',
            type: 'hidden',
            value: type
        }).appendTo($form);

        var $filename = $('<input />').attr({
            name: 'filename',
            type: 'hidden',
            value: filename
        }).appendTo($form);

        $form.appendTo('body').submit().remove();
    }

    function doDownload(url, filename, type) {
        if (!kity.Browser.chrome || ~window.location.href.indexOf('naotu.baidu.com')) {
            return doProxyDownload(url, filename, type);
        }
        var a = document.createElement('a');
        a.setAttribute('download', filename);
        a.setAttribute('href', url);
        a.click();
    }

    comboboxWidget.on('comboboxselect', function(evt, res) {
        var data = me.exportData(res.value);
        var p = KityMinder.findProtocal(res.value);
        var filename = me.getMinderTitle() + p.fileExtension;
        if (typeof(data) == 'string') {
            var url = 'data:' + (p.mineType || 'text/plain') + '; utf-8,' + encodeURIComponent(data);
            doDownload(url, filename, 'text');
        } else if (data && data.then) {
            data.then(function(url) {
                doDownload(url, filename, 'base64');
            });
        }
    }).on('beforeshow', function() {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
    }).on('aftercomboboxselect', function() {
        this.setLabelWithDefaultValue();
    });



    return comboboxWidget.button().addClass('kmui-combobox');

});