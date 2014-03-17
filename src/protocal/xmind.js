/*

    http://www.xmind.net/developer/

    Parsing XMind file

    XMind files are generated in XMind Workbook (.xmind) format, an open format that is based on the principles of OpenDocument. It consists of a ZIP compressed archive containing separate XML documents for content and styles, a .jpg image file for thumbnails, and directories for related attachments.
 */

KityMinder.registerProtocal( 'xmind', {
    fileExtension: '.xmind',

} );