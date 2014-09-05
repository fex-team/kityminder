# XMind 文件格式

## 官方说明

官方上对 XMind 文件的介绍是这样的：

> XMind files are generated in XMind Workbook (.xmind) format, an open format that is based on the principles of OpenDocument. It consists of a ZIP compressed archive containing separate XML documents for content and styles, a .jpg image file for thumbnails, and directories for related attachments.

整体来说这是一个 zip 包，里面有两个 XML 文档，一个存放内容，一个存放样式，还有一个 jpg 格式的缩略图。如果有附件，还会有存放附件的目录。

## 解析和生成目标

只解析 KityMinder 支持部分的文件内容；只生成 KityMinder 和 XMind 都支持的文件内容

使用zip.js解开xmind文件，根目录下的content.xml，描述脑图的结构，其中节点属性只有title对kityminder有用，以及children下面的topic(即节点)
将content.xml的结构和属性解析为xmind的km格式即可渲染
