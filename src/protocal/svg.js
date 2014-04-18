KityMinder.registerProtocal( "svg", function () {
	return {
		fileDescription: 'SVG 矢量图（暂不支持IE）',
		fileExtension: '.svg',
		encode: function ( json, km ) {
			// svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
			return km.getPaper().container.innerHTML.replace( /&nbsp;/g, '&#xa0;' );
		},
		recognizePriority: -1
	};
} );