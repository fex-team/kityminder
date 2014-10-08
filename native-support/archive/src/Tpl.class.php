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

        $smarty->config_dir = $dir . "tmp/configs";
        $smarty->caching = false;
        $smarty->template_dir = $dir . "tpl";
        $smarty->compile_dir = $dir . "tmp/templates_c";
        $smarty->cache_dir = $dir . "tmp/cahce";

        if ( !empty( $data ) ) {
            foreach ( $data as $k=>$v ) {
                $smarty->assign( $k, $v );
            }
        }

        return $smarty->fetch( $tplName );

    }

}