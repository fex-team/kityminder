<?php

$dependency = Array(
    'src/core/km.js',
    'src/core/command.js',
    'src/core/mindernode.js',
    'src/core/minderevent.js',
    'src/core/kityminder.js',
    'src/module/connect.js',
    'src/module/history.js',
    'src/module/icon.js',
    'src/module/keyboard.js',
    'src/module/layout.js',
    'src/module/render.js',
    'src/module/textedit.js',
    'src/module/_example.js'
);

$content = "";

header('Content-Type: text/javascript; charset=utf-8');

foreach ($dependency as $index => $dep) {
    if( $_GET['join'] != null) {
        echo file_get_contents("../$dep")."\n\n";
    } else {
        echo "document.write('<script charset=utf-8 src=\"../$dep\"></script>');";
    }
}