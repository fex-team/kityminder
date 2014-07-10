<?php
/**
 * 导出文件代理
 * 
 * @author Jinqn, techird
 */

$type = $_REQUEST['type'];

if (isset($_REQUEST['content'])) {

    $content = $_REQUEST['content'];

    if ($type == 'base64') {
        $content = base64_decode($content);
    }

    $filename = htmlspecialchars($_REQUEST["filename"]);

    if (!$filename) {
        $filename = "kikyminder";
    }

    header("Content-type: application/octet-stream; charset=utf8; name=".urlencode($filename));
    header("Accept-Length: ".strlen($content));
    header("Content-Length: ".strlen($content));
    header("Content-Disposition: attachment; filename=".urlencode($filename));
    header('Content-Description: File Transfer');
    echo $content;

} else {
    echo 'Empty Content!';
}
?>