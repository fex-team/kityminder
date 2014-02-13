/**
 * 宽度自适应工具函数
 * @param word 单词内容
 * @param hasSuffix 是否含有后缀
 */
$.wordCountAdaptive  = function( word, hasSuffix ) {

    var $tmpNode = $('<span>' ).html( word ).css( {
            display: 'inline',
            position: 'absolute',
            top: -10000000,
            left: -100000
        } ).appendTo( document.body),
        width = $tmpNode.width();

    $tmpNode.remove();
    $tmpNode = null;

    if( width < 50 ) {

        return word;

    } else {

        word = word.slice( 0, hasSuffix ? -4 : -1 );

        if( !word.length ) {
            return '...';
        }

        return $.wordCountAdaptive( word + '...', true );

    }

};