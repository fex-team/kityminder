var fs = require('fs');

var dependience = [
    'src/core/km.js',
    'src/core/command.js',
    'src/core/mindernode.js',
    'src/core/minderevent.js',
    'src/core/kityminder.js'
];

var buildPath = 'dist/kityminder.js';

var contents = [], content;

while(dependience.length) {
    contents.push(fs.readFileSync(dependience.shift()));
}

content = contents.join('\n\n');

content = '(function(kity, window) {\n\n' + content + '\n\n})(kity, window);';

fs.writeFileSync(buildPath, content);