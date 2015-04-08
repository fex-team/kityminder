['tianpan', 'tianpan-compact'].forEach(function (name) {
    var compact = name == 'tianpan-compact';

    KityMinder.registerTheme(name, {
        'background': '#3A4144 url(ui/theme/default/images/grid.png) repeat',

        'root-color': '#430',
        'root-background': '#e9df98',
        'root-stroke': '#e9df98',
        'root-font-size': 25,
        'root-padding': compact ? 15 : 20,
        'root-margin': compact ? [15, 25] : 100,
        'root-radius': 30,
        'root-space': 10,
        'root-shadow': 'rgba(0, 0, 0, .25)',
        'root-shape': 'circle',

        'main-color': '#333',
        'main-background': '#a4c5c0',
        'main-stroke': '#a4c5c0',
        'main-font-size': 15,
        'main-padding': compact ? 10 : 12,
        'main-margin': compact ? 10 : 12,
        'main-radius': 10,
        'main-space': 5,
        'main-shadow': 'rgba(0, 0, 0, .25)',
        'main-shape': 'circle',

        'sub-color': '#333',
        'sub-background': '#99ca6a',
        'sub-stroke': '#a4c5c0',
        'sub-font-size': 13,
        'sub-padding': 5,
        'sub-margin': compact ? 6 : 10,
        'sub-tree-margin': 30,
        'sub-radius': 5,
        'sub-space': 5,
        'sub-shadow': 'rgba(0, 0, 0, .25)',
        'sub-shape': 'circle',

        'connect-color': 'white',
        'connect-width': 2,
        'main-connect-width': 3,
        'connect-radius': 5,

        'selected-background': 'rgb(254, 219, 0)',
        'selected-stroke': 'rgb(254, 219, 0)',
        'selected-color': 'black',

        'marquee-background': 'rgba(255,255,255,.3)',
        'marquee-stroke': 'white',

        'drop-hint-color': 'yellow',
        'sub-drop-hint-width': 2,
        'main-drop-hint-width': 4,
        'root-drop-hint-width': 4,

        'order-hint-area-color': 'rgba(0, 255, 0, .5)',
        'order-hint-path-color': '#0f0',
        'order-hint-path-width': 1,

        'text-selection-color': 'rgb(27,171,255)',
        'line-height': 1.4
    });
});