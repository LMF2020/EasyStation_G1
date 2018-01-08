// C:\developer\code_front\AD\Diary\20171117\news.html
// C:\developer\code_front\AD\LTop\mov.mp4

const { ipcRenderer } = require('electron')

// 加载nodeJS模块
var path = require('path')
var fs = require('fs')
// 获取全局配置
const remote = require('electron').remote
var CONFIG = remote.getGlobal('CONFIG')
// AD文件的根目录
ad_root = CONFIG['DB_ROOT']

// 主模块(壳子)
var IndexModule = (function () {

    // 视频目录
    var videoDir = path.join(ad_root, "AD")

    var init = function () {
        // 启动头部视频
        try {
            startPlayVideos(videoDir)
        } catch (error) {
            console.log('视频广告启动失败', error)
        }
    }

    // 扫描视频目录下的视频文件::循环播放
    var startPlayVideos = function (dir) {
        var videoSource = []
        fs.readdirSync(dir).forEach(function (file) {
            var pathname = path.join(dir, file)
            if (pathname.match(/^.*\.(avi|AVI|wmv|WMV|flv|FLV|mpg|MPG|mp4|MP4)$/)) {
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
            console.log("开始播放->" + videoSource[videoNum])
            try {
                document.getElementById("videoAd").setAttribute("src", videoSource[videoNum])
                document.getElementById("videoAd").load()
                document.getElementById("videoAd").play()
            } catch (e) {
                console.log('视频点播异常')
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

// 启动首页模块
IndexModule.init()
