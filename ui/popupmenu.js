KityMinder.registerUI('popupmenu', function() {
    $('body').on('mousedown', function() {
        $('.popup-menu').removeClass('show');
    });

    function update() {
        
    }

    return {
        generate: function(list) {
            var $ul = $('<ul>').addClass('popup-menu');



            return {
                update: function(list) {

                }
            };
        }
    };
});