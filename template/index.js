/**
 * cron: * * * * * *
 *
 * @author bzirs
 *
 */

const Env = require('./Env')

const $ = new Env('')
const { request } = require('./utils')
!(async () => {
	// 开始
})()
	.catch(e => $.log(e))
	.finally(() => $.exitNow())
