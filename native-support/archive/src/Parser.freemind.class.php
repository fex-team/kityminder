<?php
/**
 * km => FreeMind
 */

require_once "Tpl.class.php";
require_once "FileHelper.class.php";
require_once "Ziper.class.php";
require_once "ImageCapture.class.php";

class FreeMindParser {

    public static function parse ( $source ) {

        $sourceJSON = json_decode( $source, true );

        $data = self::doParse( $sourceJSON );

        return $data;

    }

    private static function doParse ( $source ) {

        $data = self::parseTopic( $source );
        $content = Tpl::compile( "freemind/freemind.xml", array (
            'topic' => $data
        ) );

        $savepath = self::getSavePath();

        $filepath = $savepath . '/' . $data[ 'meta' ][ 'id' ] . '.mm';
        file_put_contents( $filepath, $content );

        return $filepath;

    }

    /**
     * topic 解析
     * @param array $source KM数据源
     * @return 解析后的topic数据
     */
    private static function parseTopic ( &$source, $position = null ) {

        $pos = [ "right", "left" ];
        $hasPosition = empty( $position );

        if ( !array_key_exists( "data", $source ) ) {
            return $source;
        }

        $source[ 'meta' ] = self::getTimeAndId();

        if ( !$hasPosition ) {
            $source[ 'position' ] = $position;
        }

        if ( !array_key_exists( "children", $source ) ) {
            return $source;
        }

        foreach ( $source[ "children" ] as $key => &$child ) {

            if ( $hasPosition ) {
                $position = $pos[ $key % 2 ];
            }

            self::parseTopic( $child, $position );

        }

        return $source;

    }

    private static function getSavePath () {

        $config = require( dirname(__FILE__) . '/../config.php' );
        $savepath = $config[ 'savepath' ];

        if ( !file_exists( $savepath ) ) {
            mkdir( $savepath, 0770, true );
        }

        return pathinfo( $savepath . '/test', PATHINFO_DIRNAME );

    }

    private static function getTimeAndId () {

        $timestamp = intval(  microtime( true ) * 1000 );

        return array(
            'timestamp' => $timestamp,
            'id' => md5( $timestamp )
        );

    }

}