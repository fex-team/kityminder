(function() {
    function hsl(h, s, l) {
        return kity.Color.createHSL(h, s, l);
    }

    function generate(h, compat) {
        return {
            'background': '#fbfbfb',

            'root-color': 'white',
            'root-background': hsl(h, 37, 60),
            'root-stroke': hsl(h, 37, 60),
            'root-font-size': 16,
            'root-padding': compat ? [6, 12] : [12, 24],
            'root-margin': compat ? 10 : [30, 100],
            'root-radius': 5,
            'root-space': 10,

            'main-color': 'black',
            'main-background': hsl(h, 33, 95),
            'main-stroke': hsl(h, 37, 60),
            'main-stroke-width': 1,
            'main-font-size': 14,
            'main-padding': [6, 20],
            'main-margin': compat ? 8 : 20,
            'main-radius': 3,
            'main-space': 5,

            'sub-color': 'black',
            'sub-background': 'transparent',
            'sub-stroke': 'none',
            'sub-font-size': 12,
            'sub-padding': compat ? [3, 5] : [5, 10],
            'sub-margin': compat ? [4, 8] : [15, 20],
            'sub-radius': 5,
            'sub-space': 5,

            'connect-color': hsl(h, 37, 60),
            'connect-width': 1,
            'connect-radius': 5,

            'selected-stroke': hsl(h, 26, 30),
            'selected-stroke-width': '3',

            'marquee-background': hsl(h, 100, 80).set('a', 0.1),
            'marquee-stroke': hsl(h, 37, 60),

            'drop-hint-color': hsl(h, 26, 35),
            'drop-hint-width': 5,

            'order-hint-area-color': hsl(h, 100, 30).set('a', 0.5),
            'order-hint-path-color': hsl(h, 100, 25),
            'order-hint-path-width': 1,

            'text-selection-color': hsl(h, 100, 20),
            'line-height':1.5
        };
    }

    var plans = {
        red: 0,
        soil: 25,
        green: 122,
        blue: 204,
        purple: 246,
        pink: 334
    };
    var name;
    for (name in plans) {
        KityMinder.registerTheme('fresh-' + name, generate(plans[name]));
        KityMinder.registerTheme('fresh-' + name + '-compat', generate(plans[name], true));
    }

})();