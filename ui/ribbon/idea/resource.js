/**
 * @fileOverview
 *
 * 添加和管理资源标签
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/resource', function(minder) {

    var $commandbuttonset = minder.getUI('widget/commandbuttonset');
    var $tabs = minder.getUI('ribbon/tabs');

    var $resourcePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.resource'),
        id: 'resource-panel'
    }).appendTo($tabs.idea);

    var $addInput = new FUI.Input().appendTo($resourcePanel);

    $addInput.getElement().type = 'text';

    var $addButton = new FUI.Button({
        label: '添加'
    }).appendTo($resourcePanel);

    var $resourceDrop = new FUI.DropPanel().appendTo($resourcePanel);
    var $dropContainer = $($resourceDrop.getPanelElement());
    var $ul = $('<ul></ul>').addClass('resource-list').appendTo($dropContainer);
    var $list = [];

    function addResource() {
        var resource = $addInput.getValue();
        var origin = minder.queryCommandValue('resource');
        if (/\S/.test(resource)) {
            if (!~origin.indexOf(resource)) origin.push(resource);
            origin.sort();
            minder.execCommand('resource', origin);
        }
        $addInput.setValue(null);
        update();
        $addInput.focus();
    }

    $addInput.on('inputcomplete', function(e) {
        addResource();
    });

    $addButton.on('click', addResource);

    $dropContainer.delegate('input[type=checkbox]', 'change', function() {
        minder.execCommand('resource', $dropContainer.find('input[type=checkbox]:checked').map(function(index, chk) {
            return $(chk).data('resource');
        }).toArray());
        update();
    });

    function hash(resource, used) {
        return [resource.join(','), used.join(',')].join(';');
    }

    function changed(resource, used) {
        var currentHash = hash(resource, used);
        if (currentHash == changed.lastHash) return false;
        changed.lastHash = currentHash;
        return true;
    }

    function update() {
        var resource = minder.queryCommandValue('resource');
        var used = minder.getUsedResource();

        used.sort();

        switch (minder.queryCommandState('resource')) {
            case 0:
                $addInput.enable();
                $addButton.enable();
                $resourceDrop.enable();
                $ul.find('input[type=checkbox]').removeAttr('disabled');
                break;
            case -1:
                $addInput.disable();
                $addButton.disable();
                $resourceDrop.disable();
                $ul.find('input[type=checkbox]').attr('disabled', true);
                break;
        }

        if (!changed(resource, used)) return;

        var delta = used.length - $ul.children().length;
        while (delta--) $ul.append('<li><label><input type="checkbox" /><span></span></label></li>');
        while (++delta) $ul.children().first().remove();

        used.forEach(function(name, index) {
            var $li = $ul.children().eq(index);
            var $label = $li.find('label');
            var $chk = $label.find('input');
            var $span = $label.find('span');

            $chk.data('resource', name);
            $chk.prop('checked', ~resource.indexOf(name));

            $span.text(name);
            var color = minder.getResourceColor(name);

            $li.css({
                color: color.dec('l', 60).toString(),
                backgroundColor: ~resource.indexOf(name) ? color : color.dec('a', 0.85).toRGBA()
            });
        });
    }

    minder.on('interactchange', update);

    return $resourcePanel;
});