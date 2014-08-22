KityMinder.registerUI('user', function(minder) {

    var currentUser;

    var $userPanel = $('<div class="user-panel"></div>').appendTo('#panel');

    /* 登录按钮 */
    var $loginButton = new FUI.Button({
        label: minder.getLang('ui.login'),
        text: minder.getLang('ui.login'),
        className: 'login-button'
    }).appendTo($userPanel[0]).hide();

    /* 用户按钮 */
    var $userButton = new FUI.Button({
        icon: {
            img: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
        },
        className: 'user-button'
    }).appendTo($userPanel[0]).hide();

    /* 用户菜单 */
    var $userMenu = new FUI.PopupMenu().appendTo(document.getElementById('content-wrapper')).positionTo($userButton);

    var menu = $userMenu.getMenuWidget().show();

    ['userinfo', 'gotonetdisk', 'fui-spliter', 'switchuser', 'logout'].forEach(function(name) {
        menu.appendItem(new FUI.Item({
            label: minder.getLang('ui.' + name),
            className: name,
            value: name
        }));
    });

    $userButton.on('click', function() {
        $userMenu.open();
    });

    menu.on('select', function(e, info) {

        switch (info.value) {
            case 'userinfo':
                window.open('http://i.baidu.com');
                break;
            case 'gotonetdisk':
                window.open('http://pan.baidu.com');
                break;
            case 'switchuser':
                switchUser();
                break;
            case 'logout':
                logout();
                break;
        }

        menu.clearSelect();
        $userMenu.hide();

    });


    /* 初始化网盘使用的 APP 身份 */
    fio.provider.init('netdisk', {
        apiKey: 'wiE55BGOG8BkGnpPs6UNtPbb'
    });

    fio.user.check().then(check);

    $loginButton.on('click', login);

    function check(user) {
        if (user) {
            $userButton.setLabel(user.username);
            $userButton.getIconWidget().setImage(user.smallImage);
            $userButton.show();
            $loginButton.hide();
        } else {
            $loginButton.show();
            $userButton.hide();
        }
        currentUser = user;
    }

    function logout() {
        fio.user.logout();
        $loginButton.show();
        $userButton.hide();
    }

    function login() {
        fio.user.login({
            remember: 7 * 24 * 60 * 60 // remember 7 days
        }).then(check);
    }

    function switchUser() {
        fio.user.login({
            remember: 7 * 24 * 60 * 60, // remember 7 days
            force: true
        }).then(check);
    }

    return {
        getCurrent: function() {
            return currentUser;
        }
    };
});