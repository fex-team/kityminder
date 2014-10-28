<?php
/**
 * Created by PhpStorm.
 * User: hn
 * Date: 14-8-7
 * Time: 11:16
 */

class FileHelper {

    public static function write ( $rootFd, $path, $content ) {

        $fullpath = self::format( $rootFd . $path );
        $dir = self::getDir( $fullpath );

        if ( !self::mkdirs( $dir ) ) {
            return false;
        }

        return file_put_contents( $fullpath, $content ) !== false;

    }

    public static function mkdirs ( $path ) {

        if ( file_exists( $path ) ){
            return true;
        }

        if ( self::mkdirs( dirname( $path ) ) ) {
            return mkdir( $path );
        }

    }

    public static function format ( $path ) {

        return str_replace( '//', '/', str_replace( '\\', '/', $path ) );

    }

    public static function getDir ( $dir ) {

        $dir = explode( '/', $dir );

        array_pop( $dir );

        return join( '/', $dir );

    }

}