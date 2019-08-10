KityMinder.registerProtocol('csv', function(minder) {

	return {
		fileDescription: 'KityMinder',
		fileExtension: '.csv',
		dataType: 'text',
		mineType: 'text/csv',

		encode: function(json) {
			const SEP=','
			const QUOTE='"'
			const NEWLINE='\n'

			var rootData = json.root
			/*
			 * Recursive function to dig into JSON tree and append
			 * new columns every iteration, and copying the parents in
			 * previous columns.
			 * It calls itself every time children exists in JSON and retrieves the title.
			 */
			var recFlattenJSON = function (json,prefix){
				if(json.data.text === undefined){
					throw "Error in .KM Structure: missing Title!"
				}
				var newPrefix = prefix + (prefix ? SEP : "") + QUOTE + json.data.text.replace(/"/g, '\"') + QUOTE;
				var result = ""
				if(json.children === undefined || json.children.length == 0){
					result = newPrefix + NEWLINE
				}
				else{
					json.children.forEach(function (child){
						result += recFlattenJSON(child, newPrefix)
					})
				}
				return result
			}
			var output = recFlattenJSON(rootData, "")
			return output
		}
	};
});
