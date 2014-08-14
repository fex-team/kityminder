KityMinder.registerUI('resource', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

    var $resourcePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.resource'),
        id: 'resource-panel'
    }).appendTo($tabs.idea);

    var $addInput = new FUI.Input().appendTo($resourcePanel);

    var $addButton = new FUI.Button({
        label: '添加'
    }).appendTo($resourcePanel);

    var $resourceDrop = new FUI.DropPanel().appendTo($resourcePanel);
    var $dropContainer = $($resourceDrop.getPanelElement());
    var $ul = $('<ul></ul>').addClass('resource-list').appendTo($dropContainer);

    function addResource() {
        var resource = $addInput.getValue();
        var origin = minder.queryCommandValue('resource');
        if (resource) {
            origin.push(resource);
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
        if (currentHash == changed.lastHash) return true;
        changed.lastHash = currentHash;
        return false;
    }

    function update() {
        var resource = minder.queryCommandValue('resource');
        var used = minder.getUsedResource();

        if (!changed(resource, used)) return;

        $ul.empty().append(used.map(function(name) {
            var $li = $('<li></li>'),
                $label = $('<label></label>').appendTo($li),
                $chk = $('<input type="checkbox" />')
                .data('resource', name)
                .prop('checked', ~resource.indexOf(name))
                .appendTo($label);
            $label.append(name);
            var color = minder.getResourceColor(name);
            return $li.css({
                color: color.dec('l', 60).toString(),
                backgroundColor: ~resource.indexOf(name) ? color : color.dec('a', 0.85).toRGBA()
            });
        }));

        switch (minder.queryCommandState('resource')) {
            case 0:
                $addInput.enable();
                $addButton.enable();
                $resourceDrop.enable();
                $ul.find('input[type=checkbox]').removeProp('disabled');
                break;
            case -1:
                $addInput.disable();
                $addButton.disable();
                $resourceDrop.disable();
                $ul.find('input[type=checkbox]').prop('disabled', 'disabled');
        }
    }

    minder.on('interactchange', update);

    return $resourcePanel;
});