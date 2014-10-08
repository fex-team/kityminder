<?php

/**
 * 下载远程图片
 * @param string $url 图片的绝对url
 * @param string $filepath 文件的完整路径（包括目录，不包括后缀名,例如/www/images/test） ，此函数会自动根据图片url和http头信息确定图片的后缀名
 * @return mixed 下载成功返回一个描述图片信息的数组，下载失败则返回false
 */

class ImageCapture {

    private static function init ( $url ) {

        $curl = curl_init( $url );

        curl_setopt( $curl, CURLOPT_AUTOREFERER, true );
        curl_setopt( $curl, CURLOPT_FOLLOWLOCATION, true );
        curl_setopt( $curl, CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $curl, CURLOPT_RETURNTRANSFER, true );

        // 尝试连接时间 10s
        curl_setopt( $curl, CURLOPT_RETURNTRANSFER, 10 * 1000 );
        curl_setopt( $curl, CURLOPT_MAXREDIRS, 5 );
        curl_setopt( $curl, CURLOPT_TIMEOUT, 30 );

        return $curl;

    }

    public static function capture ( $url ) {

        $mime = array(
            '.jpg' => 'image/jpeg',
            '.png' => 'image/png',
            '.gif' => 'image/gif',
            '.bmp' => 'image/bmp'
        );

        $curl = self::init( $url );

        $result = curl_exec( $curl );

        if ( curl_errno( $curl ) ) {

            curl_close( $curl );

            return null;

        }

        $info = curl_getinfo( $curl );

        curl_close( $curl );

        if ( $result === false ) {
            return null;
        }

        if ( $info[ 'http_code' ] != 200 ) {
            return null;
        }

        $suffix = self::getSuffix( $info );

        $filepath = tempnam( sys_get_temp_dir(), '' );

        $file = fopen( $filepath, 'wb' );

        if ( fwrite( $file, $result ) === false ) {
            fclose( $file );
            return null;
        }

        fclose( $file );

        return array (
            'filepath' => $filepath,
            'suffix' => $suffix,
            'mime' => $mime[ $suffix ]
        );

    }

    /**
     * 根据给定的HTTP信息获取图片的后缀
     * @param $info HTTP信息
     * @return 找到的后缀名
     */
    private static function getSuffix ( &$info ) {

        $contentType = $info[ 'content_type' ];

        $suf = array();

        if ( !empty( $contentType ) && preg_match( '/(jpg|png|jpeg|gif|bmp)/i', $contentType, $suf ) === 1 ) {
            return "." . str_replace( "jpeg", "jpg", strtolower( $suf[ 0 ] ) );
        }

        if ( preg_match( '/(jpg|png|jpeg|gif|bmp)/i', $info[ 'url' ], $suf ) === 1 ) {
            return "." . str_replace( "jpeg", "jpg", strtolower( $suf[ 0 ] ) );
        }

        return ".jpg";

    }

}