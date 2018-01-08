
const { ipcRenderer } = require('electron')

var path = require('path')
var fs = require('fs')
// global config
const remote = require('electron').remote
var CONFIG = remote.getGlobal('CONFIG')
// root dir
database = CONFIG['DB_ROOT']
dev_mode = CONFIG['DEV']

// home webview
const homeWebview = document.querySelector('#homePage')

// time interval to show screensaver
var LOCK_SCREEN_INTERVAL = 80 * 1000
// time interval to change slide of screensaver
var SCREEN_SILDE_INTERVAL = 20 * 1000
// screen height
var SCREEN_HEIGHT = 1210
// screen timeout indicator
var screenTimer = null

// index shell
var IndexModule = (function () {

    // video dir 
    var videoDir = path.join(database, "AD")
    // whether dir
    var whetherDir = path.join(database, "LWeather")
    // marquee dir
    var marqueeMenuDir = path.join(database, "txtMarquee")
    // screen dir
    var screenAdsDir = path.join(database, "LMarquee")

    // show home page
    var showHomePage = function () {

        var frameUrl = $('#homePage').attr('src')
        var isHome = new RegExp("/page/home/home.html").test(frameUrl);
        var isScreen = $("#screenSilderPage").css('opacity') === '1'

        if (!isHome && isScreen) { // screen but not home
            $('#homePage').attr('src', COMJS.HOME_URL)
            $('#frame-wrapper').animate({ opacity: 1 })
            $('#screenSilderPage').animate({ opacity: 0 })
        } else if (isScreen) { // screen and home         
            hideScreen()
        } else if (!isHome) { // not screen and not home
            $('#homePage').attr('src', COMJS.HOME_URL)
        } else {
            // IPC to show home page
            homeWebview.send('SHOW_HOME')
        }
        // other case : home but not screen : nothing to do
    }

    // load linked page in web frame 
    var showFrameLinkPage = function (url) {
        $('#homePage').attr('src', url)
        $('#frame-wrapper').animate({ opacity: 1 })
        $('#screenSilderPage').animate({ opacity: 0 })
    }

    // IPC register
    var registerIPCMessage = function () {
        homeWebview.addEventListener('ipc-message', (event) => {
            var action = event.channel
            if (action == 'OPEN_AHNEWS') { // open newspaper (hardcode)
                showFrameLinkPage('./static/page/diary/diary.htm')
            } else if (action == 'OPEN_AHFC') { // open lottery page (hardcode)
                showFrameLinkPage('http://www.ahfc.gov.cn/dlp/cp_ssq.shtml')
            } else if (action == 'OPEN_BOOKSTORE') { // open book store page (hardcode)
                showFrameLinkPage('http://220.178.12.100:8181/bookstore/index.aspx')
            }
        })
        // TODO: other webview event
    }

    var registerListeners = function () {
        // home menu button
        $('#homeBack').on('click', function (e) {
            e.preventDefault()
            showHomePage()
        })

        // marquee menu button
        $('#imgScroll').on('click', 'img', function (e) {
            e.preventDefault()
            var findPage = false
            var linkto = $(this).attr('linkto')
            // validate external page url
            if (COMJS.isValidUrl(linkto)) {
                showFrameLinkPage(linkto)
                findPage = true
            } else {
                // redirect to newspaper
                if (linkto == 'diary.htm') {
                    linkto = './static/page/diary/' + linkto
                    showFrameLinkPage(linkto)
                    findPage = true
                }
                // TODO: redirect to custom page such as newspaper
            }
            if (!findPage) {
                console.log('page not found', linkto)
            }

        })
    }

    var init = function () {
        // register events
        registerListeners()
        // register IPC
        registerIPCMessage()
        // read whether info
        try {
            readWhetherInfo(whetherDir)
        } catch (error) {
            console.log('read whether dir failed', error)
        }
        // read marquee info
        try {
            readMarqueeMenu(marqueeMenuDir)
        } catch (error) {
            console.log('read marquee dir failed', error)
        }
        // read screen ads info
        try {
            readScreenAds(screenAdsDir)
        } catch (error) {
            console.log('read screen ads failed', error)
        }

        // set screensaver timeout indicator
        setScreenTimeOut()

    }

    // read screen ads from local disk
    var readScreenAds = function (dir) {
        var imgs = COMJS.readImages(dir)
        // console.log(imgs)
        for (key in imgs) {
            var img = imgs[key]
            // var imgPath = path.join(dir, img['name'] + "." + img['ext'])
            var imgPath = database + '/' + 'LMarquee' + '/' + img['name'] + "." + img['ext']
            $("#screenSilderPage").append("<img class='screen-img' src='" + imgPath + "' linkto='" + img['url'] + "'/>")
        }

        // bind click event
        $('#screenSilderPage').on('click', function (e) {
            e.preventDefault()
            var linkto = $(this).attr('linkto')
            // redirect to the mapping link page
            if (linkto != '' && linkto == 'diary.htm') { // redirect to the newspaper
                linkto = './static/page/diary/' + linkto
                showFrameLinkPage(linkto)
            } else if (linkto != '') { // redirect to other links with http(s) header
                showFrameLinkPage(linkto)
            } else {
                console.log('show home page if link not found')
                showHomePage()
            }
        })

        // init screensaver  
        $('#screenSilderPage').coinslider({
            width: '100%',
            height: SCREEN_HEIGHT, // screen height
            delay: SCREEN_SILDE_INTERVAL, // screen change interval
            effect: "random",
            navigation: false,
            links: true
        })

        // show screensaver on startup
        // IndexModule.showScreen()
    }

    // read marquee from local disk
    var readMarqueeMenu = function (dir) {
        var imgs = COMJS.readImages(dir)
        $("#imgScroll").html("")
        for (const key in imgs) {
            var img = imgs[key]
            var imgPath = path.join(dir, img['name'] + "." + img['ext'])
            var linkto = img['url'] ? img['url'] : ''
            $("#imgScroll").append("<img src='file:///" + imgPath + "' name='imgAbcd' linkto='" + linkto + "' class='scroll-img'/>")
        }
    }

    // read whether info from local disk (e.g: EZ STATION,4000891688,壹里站)
    var readWhetherInfo = function (dir) {
        fs.readdirSync(dir).forEach(function (file) {
            if (file.match(/^.*\.txt$/)) {
                var pathname = path.join(dir, file)
                var data = fs.readFileSync(pathname, 'utf8')
                // comma-separated strings as above example
                if (data.length > 0 && data.indexOf(',') != -1) {
                    var liArr = data.split(',')
                    var li = ""
                    for (const key in liArr) {
                        li += "<li>" + liArr[key] + "</li>"
                    }
                    $("#whether").html(li)
                }
            }
        })
    }

    // show screen
    var showScreen = function () {
        $('#frame-wrapper').animate({ opacity: 0 })
        $("#screenSilderPage").animate({ opacity: 1 })
    }

    // hide screen
    var hideScreen = function () {
        $("#screenSilderPage").animate({ opacity: 0 })
        $('#frame-wrapper').animate({ opacity: 1 })
    }

    var resetScreenTimeOut = function () {
        clearScreenTimeOut()
        setScreenTimeOut()
    }

    var clearScreenTimeOut = function () {
        if (screenTimer) {
            console.log('clear screen timeout indicator', screenTimer)
            clearTimeout(screenTimer)
            screenTimer = null
        }
    }

    var setScreenTimeOut = function () {
        screenTimer = setTimeout(() => {
            showScreen()
        }, LOCK_SCREEN_INTERVAL)
    }

    return {
        init: init,
        showHomePage: showHomePage,
        showScreen: showScreen,
        hideScreen: hideScreen,
        setScreenTimeOut: setScreenTimeOut,
        clearScreenTimeOut: clearScreenTimeOut,
        resetScreenTimeOut: resetScreenTimeOut
    }
})()

IndexModule.init()

// debug webview on dev mode
if (dev_mode) {
    const webview = document.querySelector('webview')
    webview.addEventListener('dom-ready', () => {
        webview.openDevTools()
    })
}

$(document).mouseup(function (e) {
    IndexModule.resetScreenTimeOut()
})

homeWebview.addEventListener('did-stop-loading', function () {
    // $("#screenSilderPage").animate({ opacity: 0 })
});