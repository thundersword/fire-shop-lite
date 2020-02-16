class Countdown {
  static init(endTime,countdownId,that) {
	let timeStr = endTime.replace(/-/g, "/")//兼容IOS
    let end = new Date(timeStr).getTime()

    that.setData({
      [countdownId]: {
        countdown: parseInt((end - new Date().getTime())/1000),
        day: parseInt((end - new Date().getTime())/1000/60/60/24),
        hour: parseInt((end - new Date().getTime())/1000/60/60%24),
        minute: parseInt((end - new Date().getTime())/1000/60%60),
        seconds: parseInt((end - new Date().getTime())/1000)%60
      }
    })

    let interval = setInterval(() => {
      that.setData({
        [countdownId]: {
          countdown: parseInt((end - new Date().getTime())/1000),
          day: parseInt((end - new Date().getTime())/1000/60/60/24),
          hour: parseInt((end - new Date().getTime())/1000/60/60%24),
          minute: parseInt((end - new Date().getTime())/1000/60%60),
          seconds: parseInt((end - new Date().getTime())/1000)%60
        }
      })

      if (that.data[countdownId].countdown <= 0) {
        clearInterval(interval)
        that.setData({seconds: 0})
      }
    }, 1000)
  }
}
export default Countdown
