var path = require('path')
var fs = require('fs')
const CONFIG = require('electron').remote.getGlobal('CONFIG')
var DATABASE = CONFIG['cache.local_dir']

var VideoModule = (function () {

    var videoDir = path.join(DATABASE, "AD")

    var init = function () {
        try {
            startPlayVideos(videoDir)
        } catch (error) {
            console.log('load video failed', error)
        }
    }

    // read video stream source from local disk and playing in loop
    // var startPlayVideos = function (dir) {
    //     var videoEl = document.getElementById('videoAd')
    //     var videoSource = []
    //     fs.readdirSync(dir).forEach(function (file) {
    //         var pathname = path.join(dir, file)
    //         if (pathname.match(/^.*\.(mp4|MP4)$/)) {
    //             videoSource.push(pathname)
    //         }
    //     })

    //     var videoCount = videoSource.length
    //     var i = 0
    //     function myHandler() {
    //         i++
    //         if (i == videoCount) {
    //             i = 0
    //             playme(i)
    //         } else {
    //             playme(i)
    //         }
    //     }
    //     function playme(videoNum) {
    //         // console.log("play ->" + videoSource[videoNum])
    //         if (typeof flvPlayer !== "undefined") {
    //             if (flvPlayer != null) {
    //                 flvPlayer.unload()
    //                 flvPlayer.detachMediaElement();
    //                 flvPlayer.destroy()
    //                 flvPlayer = null;
    //             }
    //         }
    //         try {
    //             if (flvjs.isSupported()) {
    //                 var url = videoSource[videoNum]
    //                 // var type = url.match(/^.*\.(flv|FLV)$/) ? 'flv' : 'mp4'
    //                 var flvPlayer = flvjs.createPlayer({
    //                     type: 'mp4',
    //                     url: url
    //                 });
    //                 flvPlayer.attachMediaElement(videoEl);
    //                 flvPlayer.load();
    //                 flvPlayer.play();
    //             }

    //         } catch (e) {
    //             console.log('video streaming playback failed')
    //         }
    //     }
    //     document.getElementById('videoAd').addEventListener('ended', myHandler, false)
    //     if (videoCount > 0) {
    //         playme(0)
    //     }

    // }

    var startPlayVideos = function (dir) {
        var videoSource = []
        fs.readdirSync(dir).forEach(function (file) {
            var pathname = path.join(dir, file)
            if (pathname.match(/^.*\.(mp4|MP4|webm|ogg)$/)) {
                videoSource.push(pathname)
            }
        })
        var videoCount = videoSource.length
        var i = 0
        function myHandler() {
            i++
            if (i == videoCount) {
                i = 0
                playme(i)
            } else {
                playme(i)
            }
        }
        function playme(videoNum) {
            // console.log("currently playing->" + videoSource[videoNum])
            try {
                document.getElementById("videoAd").setAttribute("src", videoSource[videoNum])
                document.getElementById("videoAd").load()
                document.getElementById("videoAd").play()
            } catch (e) {
                console.log('play errors')
            }
        }
        document.getElementById('videoAd').addEventListener('ended', myHandler, false)
        if (videoCount > 0) {
            document.getElementById("videoAd").setAttribute("src", videoSource[0])
        }
    }

    return {
        init: init
    }
})()

VideoModule.init()
