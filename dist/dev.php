<?php

$dependency = Array(
    'src/core/km.js',
    'src/core/command.js',
    'src/core/mindernode.js',
    'src/core/minderevent.js',
    'src/core/kityminder.js'
);

$content = "";

header('Content-Type: text/javascript');

foreach ($dependency as $index => $dep) {
    echo file_get_contents("../$dep")."\n\n";
}