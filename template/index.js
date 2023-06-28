/**
 * cron: * * * * * *
 *
 * epic 每周免费游戏通知
 *
 */

const Env = require('./Env')

const $ = new Env('开始测试')

!(async () => {})()
	.catch(e => $.log(e))
	.finally(() => $.exitNow())
