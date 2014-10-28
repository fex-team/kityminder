<?php
/**
 * Created by PhpStorm.
 * User: hn
 * Date: 14-8-6
 * Time: 16:02
 */

require_once dirname( __FILE__ ) . "/../libs/Smarty.class.php";
date_default_timezone_set( 'Asia/Chongqing' );


class Tpl {

    public static function compile ( $tplName, $data = null ) {

        $smarty = new Smarty();

        $dir = dirname( __FILE__ ) . '/';

        $smarty->config_dir = self::createDir( $dir . "tmp/configs" );
        $smarty->caching = false;
        $smarty->template_dir = self::createDir( $dir . "tpl" );
        $smarty->compile_dir = self::createDir( $dir . "tmp/templates_c" );
        $smarty->cache_dir = self::createDir( $dir . "tmp/cahce" );

        if ( !empty( $data ) ) {
            foreach ( $data as $k=>$v ) {
                $smarty->assign( $k, $v );
            }
        }

        return $smarty->fetch( $tplName );

    }

    private static function createDir ( $path ) {

        if ( file_exists( $path ) ) {
            return $path;
        }

        if ( !mkdir( $path, 0700, true ) ) {
            throw new Exception( "directory creation failed: " . $path );
        }

        return $path;

    }

}