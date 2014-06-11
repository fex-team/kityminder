(function(utils) {
    KM.registerWidget('resource', {
        tpl: '<div class="resource-container">' +
            '<div class="add-resource">' +
            '<input type="text" /><button class="button">添加</button>' +
            '<ul class="global-resource"></ul>' +
            '</div>' +
            '</div>' +
            '<div class="no-selected">未选中节点</div>',

        initContent: function(km, $w) {
            var lang = km.getLang('dialogs.resource'),
                html = $.parseTmpl(this.tpl, lang);
            this.root().html(html);
        },

        initEvent: function(km, $w) {
            var $container = $w.find('.resource-container');
            var $noSelected = $w.find('.no-selected');
            var $current = $w.find('.current-resource').hide();
            var $addInput = $w.find('.add-resource input');
            var $addButton = $w.find('.add-resource button');
            var $global = $w.find('.global-resource');

            function switchDisplay() {
                if (!km.getSelectedNodes().length) {
                    $container.hide();
                    $noSelected.show();
                } else {
                    $container.show();
                    $noSelected.hide();
                }
            }

            function addResource() {
                var resource = $addInput.val();
                var origin = km.queryCommandValue('resource');
                if (resource) {
                    origin.push(resource);
                    km.execCommand('resource', origin);
                }
                $addInput.val(null);
            }

            $addInput.on('keydown', function(e) {
                if (e.keyCode == 13) addResource();
            });

            $addButton.click(addResource);

            switchDisplay();

            $global.delegate('input[type=checkbox]', 'change', function() {
                km.execCommand('resource', $global.find('input[type=checkbox]:checked').map(function(index, chk) {
                    return $(chk).data('resource');
                }).toArray());
            });

            km.on('interactchange', function(e) {
                var resource = this.queryCommandValue("resource");
                var used = this.getUsedResource();

                switchDisplay();

                $global.empty().append(used.map(function(name) {
                    var $li = $('<li></li>'),
                        $label = $('<label></label>').appendTo($li),
                        $chk = $('<input type="checkbox" />')
                        .data('resource', name)
                        .prop('checked', ~resource.indexOf(name))
                        .appendTo($label);
                    $label.append(name);
                    var color = km.getResourceColor(name);
                    return $li.css({
                        color: color.dec('l', 60).toString(),
                        backgroundColor: ~resource.indexOf(name) ? color : color.dec('a', 0.85).toRGBA()
                    });
                }));
            }).fire('interactchange');
        },
        width: 250

    });
})(KM.Utils);