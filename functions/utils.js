module.exports = {
    /**从阿里云的零时区获取北京时间 */
    getNowDay(_aliyun) {
        _aliyun = true //不知道为什么，在nodejs本地运行，时间也是英国时间，所以这里设置为true，强行转为北京时间
        if (_aliyun) {
            return new Date(new Date().getTime() + 28800000) //直接获取北京时间
        }
        // else {
        //     return new Date()
        // }
    },
    /**给时间补充0，变为字符串，传入的需要是正整数 */
    addZerp(nums) {
        return nums < 10 ? '0' + nums : nums + ''
    },
}