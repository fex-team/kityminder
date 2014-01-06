<?php

$dependency = Array(
    'src/core/kityminder.js',
    'src/core/utils.js',
    'src/core/command.js',
    'src/core/node.js',
    'src/core/module.js',
    'src/core/event.js',
    'src/core/minder.js',
    'src/core/minder.data.js',
    'src/core/minder.event.js',
    'src/core/minder.module.js',
    'src/core/minder.command.js',
    'src/core/minder.node.js',
    'src/core/minder.select.js',
    'src/module/connect.js',
    'src/module/history.js',
    'src/module/icon.js',
    'src/module/layout.js',
    'src/module/render.js',
    'src/module/mouse.js',
    'src/module/keyboard.js',
    'src/module/textedit.js'
);

$content = "";


foreach ($dependency as $index => $dep) {
    if( $_GET['join'] != null) {
        header('Content-Type: text/javascript; charset=utf-8');
        echo file_get_contents("../$dep")."\n\n";
    } else {
        echo "document.write('<script charset=utf-8 src=\"../$dep\"></script>');";
    }
}