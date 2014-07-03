(function() {

    function doDownload(url, filename, type) {
        var content = url.split(',')[1];
        var $form = $('<form></form>').attr({
            'action': 'download.php',
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

    function buildDataUrl(mineType, data) {
        return 'data:' + mineType + '; utf-8,' + encodeURIComponent(data);
    }

    function doExport(minder, type) {
        var data = minder.exportData(type);
        var protocal = KityMinder.findProtocal(type);
        var filename = minder.getMinderTitle() + protocal.fileExtension;
        var mineType = protocal.mineType || 'text/plain';

        if (typeof(data) == 'string') {

            doDownload(buildDataUrl(mineType, data), filename, 'text');

        } else if (data && data.then) {

            data.then(function(url) {
                doDownload(url, filename, 'base64');
            });

        }
    }

    kity.extendClass(Minder, {
        exportFile: function(type) {
            doExport(this, type);
            return this;
        }
    });

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

        comboboxWidget.on('comboboxselect', function(evt, res) {
            doExport(me, res.value);
        }).on('beforeshow', function() {
            if ($combox.parent().length === 0) {
                $combox.appendTo(me.$container.find('.kmui-dialog-container'));
            }
        }).on('aftercomboboxselect', function() {
            this.setLabelWithDefaultValue();
        });

        return comboboxWidget.button().addClass('kmui-combobox');

    });

})();