<?php

$dependency = Array(
    'src/core/kityminder.js'
        ,'src/core/utils.js'
        ,'src/core/command.js'
        ,'src/core/node.js'
        ,'src/core/module.js'
        ,'src/core/event.js'
        ,'src/core/minder.js'
        ,'src/core/minder.data.js'
        ,'src/core/minder.event.js'
        ,'src/core/minder.module.js'
        ,'src/core/minder.command.js'
        ,'src/core/minder.node.js'
        ,'src/core/keymap.js'
        ,'src/core/minder.lang.js'
        ,'src/core/minder.defaultoptions.js'
        ,'src/core/browser.js'
        ,'src/module/geometry.js'
        ,'src/module/history.js'
        ,'src/module/icon.js'
        ,'src/module/layout.js'
        ,'src/module/layout.default.js'
        ,'src/module/layout.bottom.js'
        ,'src/core/minder.select.js'
        ,'src/module/view.js'
        ,'src/module/dragtree.js'
        ,'src/module/dropfile.js'
        ,'src/module/keyboard.js'
        ,'src/module/select.js'
        ,'src/module/history.js'
        ,'src/module/editor.js'
        ,'src/module/editor.range.js'
        ,'src/module/editor.receiver.js'
        ,'src/module/editor.selection.js'
        ,'src/module/basestyle.js'
        ,'src/module/font.js'
        ,'src/module/zoom.js'
        ,'src/ui/jquery-ui-1.10.4.custom.min.js'
        ,'src/ui/widget.js'
        ,'src/ui/button.js'
        ,'src/ui/toolbar.js'
        ,'src/ui/menu.js'
        ,'src/ui/dropmenu.js'
        ,'src/ui/splitbutton.js'
        ,'src/ui/colorsplitbutton.js'
        ,'src/ui/popup.js'
        ,'src/ui/scale.js'
        ,'src/ui/colorpicker.js'
        ,'src/ui/combobox.js'
        ,'src/ui/buttoncombobox.js'
        ,'src/ui/modal.js'
        ,'src/ui/tooltip.js'
        ,'src/ui/tab.js'
        ,'src/ui/separator.js'
        ,'src/ui/scale.js'
        ,'src/adapter/utils.js'
        ,'src/adapter/adapter.js'
        ,'src/adapter/button.js'
        ,'src/adapter/combobox.js'
        ,'src/adapter/saveto.js'
        ,'src/adapter/view.js'
        ,'src/adapter/tooltips.js'
        ,'src/adapter/layout.js'
        ,'src/adapter/node.js'
        ,'src/adapter/contextmenu.js'
        ,'src/adapter/dialog.js'
        ,'src/protocal/xmind.js'
        ,'src/protocal/freemind.js'
        ,'src/protocal/mindmanager.js'
        ,'src/protocal/plain.js'
        ,'src/protocal/json.js'
        ,'src/protocal/png.js'
        ,'src/protocal/svg.js'
    );


$content = "";


header('Content-Type: text/javascript; charset=utf-8');
foreach ($dependency as $index => $dep) {
    if( $_GET['join'] != null || $argv[1] == 'join') {
        echo file_get_contents("../$dep")."\n\n";
    } else {
        echo "document.write('<script charset=utf-8 src=\"../$dep\"></script>');";
    }
}