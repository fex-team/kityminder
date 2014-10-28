<?php

require_once "Parser.xmind.class.php";
require_once "Parser.freemind.class.php";

class Parser {

    public static function toXMind ( $source, $previewImage = null ) {
        return XMindParser::parse( htmlspecialchars( $source, ENT_NOQUOTES ), $previewImage );
    }

    public static function toFreeMind ( $source ) {
        return FreeMindParser::parse( htmlspecialchars( $source, ENT_NOQUOTES ) );
    }

}