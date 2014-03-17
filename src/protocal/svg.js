KityMinder.registerProtocal( "svg", function () {
	return {
		fileDescription: 'SVG 矢量图',
		fileExtension: '.svg',
		encode: function ( json, km ) {
			return km.getPaper().container.innerHTML;
		},
		recognizePriority: -1
	};
} );