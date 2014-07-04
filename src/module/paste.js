KityMinder.registerModule( "pasteModule", function () {
    var km = this,

        _cacheNodes = [],

        _selectedNodes = [],

        _copystatus= false,

        _curstatus = false;

    function appendChildNode(parent, child) {
        _selectedNodes.push(child);
        km.appendNode(child,parent);
        child.render();
        child.setLayoutOffset(null);
        var children = utils.cloneArr(child.children);
        for (var i = 0, ci; ci = children[i++]; ) {
            appendChildNode(child, ci);
        }
    }

    function getNodes(arr,isCut){
        _cacheNodes = [];
        for(var i= 0,ni;ni=arr[i++];){
            _cacheNodes.push(ni.clone());
            if(isCut && !ni.isRoot()){
                km.removeNode(ni);
            }
        }
    }
    return {
        'events': {
            'normal.keydown': function (e) {
                var keys = KityMinder.keymap;

                var keyEvent = e.originEvent;

                if (keyEvent.ctrlKey || keyEvent.metaKey) {

                    switch (keyEvent.keyCode) {
                        case keys.c:
                            getNodes(km.getSelectedAncestors(true));
                            _copystatus = true;
                            break;
                        case keys.x:
                            getNodes(km.getSelectedAncestors(),true);
                            km.layout(300);
                            _curstatus = true;
                            break;
                        case keys.v:
                            if(_cacheNodes.length){
                                var node = km.getSelectedNode();
                                if(node){
                                    km.fire('saveScene');
                                    for(var i= 0,ni;ni=_cacheNodes[i++];){
                                        appendChildNode(node,ni.clone());
                                    }
                                    km.layout(300);
                                    km.select(_selectedNodes,true);
                                    _selectedNodes = [];
                                    km.fire('saveScene');
                                }
                            }

                    }
                }


            }
        }

    };
} );