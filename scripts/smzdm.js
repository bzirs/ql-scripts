/**
 * cron: 20 7 * * * *
 *
 * @author bzirs
 *
 */

const Env = require('./Env')

const $ = new Env('什么值得买')
const { request } = require('./utils')
!(async () => {

  const signUrl = ''

})()
	.catch(e => $.log(e))
	.finally(() => $.exitNow())
