<?php
/**
 * User: hancong
 */

class Ziper {

    public static function compress ( $filepath, $rootpath = null ) {

        $filepath = realpath( $filepath );

        if ( !isset( $rootpath ) ) {
            $rootpath = $filepath;
        }
        $rootpath = realpath( $rootpath );

        $archive = new ZipArchive();

        $filename = dirname( $filepath ) . '/' . basename( $filepath ) . '.zip';

        $state = $archive->open( $filename, ZipArchive::OVERWRITE );

        if ( $state !== true ) {
            return null;
        }

        Ziper::_compress( $archive, $filepath, $rootpath );

        $archive->close();

        return $filename;

    }

    private static function _compress ( $archive, $filepath, $path ) {

        if ( !file_exists( $filepath ) ) {
            return;
        }

        if ( is_dir( $filepath ) ) {

            $childs = scandir( $filepath );

            foreach ( $childs as $f ) {

                if ( $f == "." || $f == ".." ) {
                    continue;
                }

                Ziper::_compress( $archive, $filepath . '/' . $f, $path );

            }

        } else {

            $archive->addFile( $filepath, str_replace( $path, "", $filepath ) );

        }

    }

}