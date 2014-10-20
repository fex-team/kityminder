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
    if (isset($_REQUEST['iehack'])) {
        $filename = urlencode($filename);
    }

    header("Content-type: application/octet-stream; charset=utf8; name=".urlencode($filename));
    header("Accept-Length: ".strlen($content));
    header("Content-Length: ".strlen($content));
    header("Content-Disposition: attachment; filename=".$filename);
    header('Content-Description: File Transfer');

    if (isset($_REQUEST['stamp'])) {
        setcookie($_REQUEST['stamp'], 1, time() + 30);
    }

    echo $content;

} else {
    echo 'Empty Content!';
}
?>