<?php

include_once "archive/src/Parser.class.php";

$type = $_REQUEST[ 'type' ];

if ( $type === 'xmind' ) {
    $file = Parser::toXMind( $_REQUEST['data'] );
} else if ( $type === 'freemind' ) {
    $file = Parser::toFreeMind( $_REQUEST['data'] );
}

if ( empty( $file ) ) {
    print 'parse error: empty data or data invalid!';
    die;
}

Header ( "Content-type: application/octet-stream" );
Header ( "Accept-Ranges: bytes" );
Header ( "Accept-Length: " . filesize ( $file ) );

$download = isset($_REQUEST['download']);
if ($download) {
    $downloadName = $_REQUEST[ 'filename' ];
    $downloadName = explode( ".", $downloadName );
    $downloadName = $downloadName[ 0 ];
    $T = array(
        'xmind' => '.xmind',
        'freemind' => '.mm'
    );
    Header ( "Content-Disposition: attachment; filename=" . $downloadName . $T[ $type ] );
}

readfile( $file );
unlink( $file );