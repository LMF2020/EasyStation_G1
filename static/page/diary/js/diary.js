var path = require('path')
var fs = require('fs')
const remote = require('electron').remote
var CONFIG = remote.getGlobal('CONFIG')
var DATABASE = CONFIG['cache.local_dir']
var news_dir = path.join(DATABASE, "Diary")

var DiaryModule = (function () {

    var _diary = null
    var _order = 0

    var init = function () {
        bindListeners()
        // read news from local disk
        var newsData = readLocalSync()
        // show first diary page
        showDiary(newsData)
        // scale 40% up on news image first loaded
        $('#imageFullScreen').smartZoom('zoom', 0.4)

    }

    var readLocalSync = function () {
        var newsData = {
            FilesList: [],
            State: 0
        }
        try {
            fs.readdirSync(news_dir).forEach(function (file_name) {
                var dateDir = path.join(news_dir, file_name)
                var isDir = fs.lstatSync(dateDir).isDirectory()
                // check if date format is yyyy-mm-dd
                if (isDir && file_name.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/)) {
                    var imgs = fs.readdirSync(dateDir)
                    newsData.FilesList.push({
                        Key: file_name,
                        Value: imgs
                    })
                }
            })
            if (newsData.FilesList.length > 0) {
                // Only remain latest 7-days paper
                var _arr = newsData.FilesList;
                if(_arr.length > 7){
                    newsData.FilesList = _arr.slice(_arr.length - 7)
                }
                newsData.State = 1
            }
        } catch (error) {
            console.log('read news dir failed', error)
        }
        return newsData
    }

    // show diary
    var showDiary = function (newsData) {
        if (newsData.State > 0) {
            if (_diary != newsData.FilesList) {
                _diary = newsData.FilesList

                // dir size
                _len = _diary.length

                $("#date").html('')
                // create date ui
                $(_diary).each(function (index, item) {
                    $("#date").append('<a href="javascript:void(0)">' + item.Key + '</a>')
                })
                // bind date click
                $("#date").on('click', 'a', function (e) {
                    e.preventDefault()
                    showDiaryByDate($(this).html())
                    hiddenlayer()
                })
                
                showDiaryByDate(_diary[_len - 1].Key)

                bindSmartZoom()
            }
        }
    }

    // show diary by date selector
    var showDiaryByDate = function (date) {
        if (_diary != null && _diary.length > 0) {
            $(_diary).each(function (index, item) {
                if (item.Key == date) {
                    $("div.cs_slider").html('')
                    $("#layout").html('')
                    $(item.Value).each(function (_index, _i) {
                        $("div.cs_slider").append('<img src=' + 'file:///' + news_dir + '/' + item.Key + '/' + _i + ' />')
                        if (_index == 0) $("#imageFullScreen").attr({ 'src': 'file:///' + news_dir + '/' + item.Key + '/' + _i })
                        $("#layout").append('<a href="javascript:void(0)">' + (_i.split(".")[0]).toUpperCase() + '</a>')
                    })
                    // $("#layout>a").on('click', function () { moveSliderLink($(this).index()) })
                    _order = 0
                    $("#left-side").css({ 'opacity': '0' })
                    $("#right-side").css({ 'opacity': '1' })

                    // bindSmartZoom()
                }
            })
        }
    }

    var hiddenlayer = function () {
        $("#layout").css({ left: '-238px' })
        $("#btnDate").css({ 'background': 'rgba(253,188,29,1)' })
        $("#date").css({ left: '-528px' })
        $("#btnLayout").css({ 'background': 'rgba(253,188,29,1)' })
    }

    // show paper by moving paper number
    var moveSliderLink = function (order) {
        _order = order
        $("#imageFullScreen").attr({ 'src': $("div.cs_slider>img:eq(" + order + ")").attr('src') })
        $("#left-side").css({ 'opacity': (order == 0) ? '0' : '1' })
        $("#right-side").show().css({ 'opacity': (order == $("#layout>a").length - 1) ? '0' : '1' })
    }

    // bind zoom event
    var bindSmartZoom = function () {
        $('#imageFullScreen').smartZoom({
            'containerClass': 'zoomableContainer'
        })
        $('#topPositionMap,#leftPositionMap,#rightPositionMap,#bottomPositionMap').on("click", moveButtonClickHandler)
        $('#zoomInButton,#zoomOutButton').on("click", zoomButtonClickHandler)
    }

    var zoomButtonClickHandler = function (e) {
        var scaleToAdd = 0.4
        if (e.target.id == 'zoomOutButton') scaleToAdd = -scaleToAdd
        $('#imageFullScreen').smartZoom('zoom', scaleToAdd)
    }

    var moveButtonClickHandler = function (e) {
        var pixelsToMoveOnX = 0
        var pixelsToMoveOnY = 0

        switch (e.target.id) {
            case "leftPositionMap":
                pixelsToMoveOnX = 50
                break
            case "rightPositionMap":
                pixelsToMoveOnX = -50
                break
            case "topPositionMap":
                pixelsToMoveOnY = 50
                break
            case "bottomPositionMap":
                pixelsToMoveOnY = -50
                break
        }
        $('#imageFullScreen').smartZoom('pan', pixelsToMoveOnX, pixelsToMoveOnY)
    }

    var bindListeners = function () {

        // trigger to select by page number
        $("#layout").on('click', 'a', function () {
            moveSliderLink($(this).index())
        })

        // trigger to show date selector panel
        $("#btnDate").on('click', function (e) {
            e.preventDefault()
            $("#layout").animate({ left: '-238px' })
            $("#btnLayout").css({ 'background': 'rgba(253,188,29,1)' })
            if ($("#layout").css('left').replace('px', '') < 0) {
                $(this).css({ 'background': 'rgba(58, 56, 63, 0.5)' })
                $("#layout").animate({ left: '0px' })
            }
            else {
                $(this).css({ 'background': 'rgba(253,188,29,1)' })
                $("#layout").animate({ left: '-238px' })
            }
        })

        // trigger to show alpha selector panel
        $("#btnLayout").on('click', function (e) {
            e.preventDefault()
            $("#date").animate({ left: '-528px' })
            $("#btnDate").css({ 'background': 'rgba(253,188,29,1)' })
            if ($("#date").css('left').replace('px', '') < -5) {
                $(this).css({ 'background': 'rgba(58, 56, 63, 0.5)' })
                $("#date").animate({ left: '-5px' })
            }
            else {
                $(this).css({ 'background': 'rgba(253,188,29,1)' })
                $("#date").animate({ left: '-528px' })
            }
        })

        $("#left-side").on('click', function (e) {
            e.preventDefault()
            if (_order > 0) moveSliderLink(_order - 1)
        })

        $("#right-side").on('click', function (e) {
            e.preventDefault()
            if (_order < ($("#layout>a").length - 1)) moveSliderLink(_order + 1)
        })

        window.onerror = function () { return true }
        document.oncontextmenu = function () { return false } // disable context menu
        document.onpaste = function () { return false } // disable paste
        document.oncopy = function () { return false } // disable copy
        document.oncut = function () { return false } // diable cut
        document.onselectstart = function () { return false } // disable select
    }

    return {
        init: init
    }

})()

DiaryModule.init()

var loaded = false

/**
 * Help news image scale 40% up and move 400px up on loaded
 */
function imgLoaded(id) {
    if (!loaded) {
        setTimeout(() => {
            $('#imageFullScreen').smartZoom('zoom', 0.4, '', 0)
            setTimeout(() => {
                $('#imageFullScreen').smartZoom('pan', 0, 400)
            }, 20);
            loaded = true
        }, 500)
    }
}
