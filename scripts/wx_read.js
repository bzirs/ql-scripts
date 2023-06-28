/*
微信阅读
需要青龙环境

cron: 11 8 * * 8


入口，微信打开 -> https://zl1208224800-1314804847.cos.ap-nanjing.myqcloud.com/index.html?upuid=10327150
抓包m.*.work域名下cookie,填入环境变量 yuedu，多账户换行隔开
抓包User-Agent填入变量 ydua

原地址 https://gitlab.com/acoolbook/ym/-/raw/main/wx_yd.js

每天会验证2次左右，碰到验证文章手动打开看一篇即可
当前每日30篇*6轮180篇文章约2.2元
会自动提现
*/
const Env = require('./Env')
const $ = new Env('微信阅读')
const notify = $.isNode() ? require('../sendNotify') : ''
let envSplitor = ['@', '\n']
let httpResult, httpReq, httpResp
let ckName = 'yuedu'
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || ''
let ua = process.env['ydua'] || ''
let userList = []
let userIdx = 0
let userCount = 0
var msg = ''
let newurl = 'http://m.xmrygnuv.shop'
///////////////////////////////////////////////////////////////////
if (!ua) {
	console.log('请抓包User-Agent并填入变量 ydua 后再运行')
	return
}
class UserInfo {
	constructor(str) {
		//console.log(str)
		;(this.index = ++userIdx), (this.idx = `账号[${this.index}] `), (this.ck = str) //.split('#'), this.u = this.ck[0], this.t = this.ck[1]
	}

	async getreadurl() {
		try {
			let t = Date.now()
			this.ul = newurl + `/tuijian/do_read?for\u003d\u0026zs\u003d\u0026pageshow\u0026r\u003d0.016638941704032684`
			let body = ``
			let urlObject = popu(this.ul, body, this.ck)
			await httpRequest('get', urlObject)
			let result = httpResult
			if (result.jkey && result.url) {
				this.jkey = result.jkey
				await this.read(result.url.split('redirect_uri=')[1])
			}
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}

	async read(readurl) {
		try {
			let t = Date.now()
			readurl = decodeURIComponent(readurl)
			var sj = Math.random() * (8000 - 6000) + 6000

			if (readurl.indexOf('jump') == -1) {
				console.log('疑似检测文章，不阅读')

				await $.wait(sj)
				return
				await this.readfinish()
			}
			this.jumpid = readurl.match(/jumpid=(.*?)&/)[1]
			this.state = readurl.match(/state=(.*?)&/)[1]
			this.ul =
				newurl + `/fast_reada/oiejr?jumpid=${this.jumpid}&code=031oV60w32RVa03URy0w3E0mzj3oV607&state=` + this.state
			//console.log(this.ul)

			let body = ``
			let urlObject = popu(this.ul, body, this.ck)
			await httpRequest('get', urlObject)
			let result = httpResult
			//console.log(result)
			//var sj = Math.random() * (8000 - 6000) + 6000
			//console.log('等待:'+ sj)
			await $.wait(sj)
			await this.readfinish()
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}
	async readfinish() {
		try {
			this.url = newurl + '/tuijian/do_read?for=&zs=&pageshow=&r=0.7882316111246435&jkey=' + this.jkey
			let body = ``
			let urlObject = popu(this.url, body, this.ck)
			//console.log(urlObject)
			await httpRequest('get', urlObject)
			let result = httpResult
			if (result && result.success_msg) {
				console.log(result.success_msg)
			} else {
				console.log(result)
			}
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}
	async getreadinfo() {
		try {
			let t = Date.now()
			let url = newurl + `/tuijian`
			let body = ``
			let urlObject = popu(url, body, this.ck)
			//console.log()
			await httpRequest('get', urlObject)
			let result = httpResult
			//console.log(result)

			if (result && result.data) {
				result = result.data
				this.uid = result.user.uid
				console.log(`\n今日阅读数量/收益：${result.infoView.num}/${result.infoView.score}分 \n`)
				console.log(`\n当前余额：${result.user.score}分  \n`)
				this.cishu = result.infoView.rest

				if (result.infoView.status != 1) {
					this.fb = 1
				}
				if (result.infoView.status == 3) {
					// console.log(result.infoView.msg)
					msg += ''
					console.log('检测文章，需手动过')
					msg += `\n${this.idx} 碰到检测文章\n`
					this.fb = 1
				} else if (result.infoView.status == 4) {
					console.log(result.infoView.msg)
				} else if (result.infoView.rest == 0) {
					console.log(result.infoView.msg)
				}
			}
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}

	async withdrawal() {
		try {
			let t = Date.now()
			let url = newurl + `/withdrawal`
			let body = ``
			let urlObject = popu(url, body, this.ck)
			await httpRequest('get', urlObject)
			let result = httpResult
			if (result.data.user) {
				result = result.data.user
				console.log(`\n当前账号余额 ${result.score}分 \n`)
				if (this.ck.indexOf('##') != -1) return
				this.f = parseInt(result.score) //= Number(Math.floor(result.info.sum / 1000))

				if (this.f < 30) {
					console.log(`不满足 提现门槛`)
				} else {
					console.log(`去提现${this.f / 100}元。。。。。。`)
					await this.doWithdraw(this.f)
				}
			}
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}
	async doWithdraw(tx) {
		try {
			if (tx > 2000) tx = 2000
			let t = Date.now()
			let url = newurl + `/withdrawal/doWithdraw`
			let body = `amount=` + tx
			let urlObject = popu(url, body, this.ck)
			await httpRequest('post', urlObject)
			let result = httpResult
			console.log(result)
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}
	async task() {
		try {
			let abc = [...new Array(15).keys()]
			console.log(`\n=========== ${this.idx} 开始阅读文章 ===========\n`)
			await this.getreadinfo()
			//console.log(this.fb)
			if (this.fb != 1) {
				for (let i = 0; i < this.cishu; i++) {
					await this.getreadurl()

					/*
                    break
                    if (this.dx == 1) break
                    await this.getreadurl()
                    if (this.fx == 1) break
                    */
				}
				await this.getreadinfo()
				//await $.wait(15000)
			}
			await this.withdrawal()
		} catch (e) {
			console.log(e)
		} finally {
			return Promise.resolve(1)
		}
	}
}

!(async () => {
	if (typeof $request !== 'undefined') {
		await GetRewrite()
	} else {
		if (!(await checkEnv())) return
		if (userList.length > 0) {
			await gethost()
			console.log('获取到newurl：' + newurl)
			for (let user of userList) {
				await user.task()
			}
			if (msg) await notify.sendNotify('微信阅读检测文章', msg)
		}
	}
})()
	.catch(e => console.log(e))
	.finally(() => $.done())

///////////////////////////////////////////////////////////////////

async function gethost() {
	try {
		let t = Date.now()
		let url = 'https://qun.haozhuang.cn.com/fq_url/rk'
		let body = ''
		let urlObject = popugethost(url, body)
		await httpRequest('get', urlObject)
		let result = httpResult
		//console.log(result)
		if (result.jump) {
			newurl = result.jump.slice(0, -1)
		}
	} catch (e) {
		console.log(e)
	} finally {
		return Promise.resolve(1)
	}
}

async function checkEnv() {
	if (userCookie) {
		let splitor = envSplitor[0]
		for (let sp of envSplitor) {
			if (userCookie.indexOf(sp) > -1) {
				splitor = sp
				break
			}
		}
		for (let userCookies of userCookie.split(splitor)) {
			if (userCookies) userList.push(new UserInfo(userCookies))
		}
		userCount = userList.length
	} else {
	}

	console.log(`找到[${ckName}] 变量 ${userCount}个账号`)

	return true
}

////////////////////////////////////////////////////////////////////
function popu(url, body = '', ck) {
	//console.log(ck) /?upuid\u003d10314864
	let host = url.replace('//', '/').split('/')[1]
	let urlObject = {
		url: url,
		headers: {
			Host: host,
			Connection: 'keep-alive',
			Accept: '*/*',
			'User-Agent': ua,
			'X-Requested-With': 'com.tencent.mm',
			Referer: newurl + '/tuijian/read',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'zh-CN,zh;q\u003d0.9,en-US;q\u003d0.8,en;q\u003d0.7',
			Cookie: ck
		},
		timeout: 5000
	}
	if (body) {
		urlObject.body = body
	}

	return urlObject
}
function popugethost(url, body = '', ck) {
	//console.log(ck)
	let host = url.replace('//', '/').split('/')[1]
	let urlObject = {
		url: url,
		headers: {
			Host: 'qun.haozhuang.cn.com',
			'User-Agent': ua,
			Accept: '*/*',
			Origin: 'https://kygj0209122405-1316151879.cos.ap-nanjing.myqcloud.com',
			'X-Requested-With': 'com.tencent.mm',
			Referer: 'https://kygj0209122405-1316151879.cos.ap-nanjing.myqcloud.com/index.html?upuid\u003d10315076'
		},
		timeout: 5000
	}
	if (body) {
		urlObject.body = body
	}

	return urlObject
}

async function httpRequest(method, url) {
	//console.log(url)
	;(httpResult = null), (httpReq = null), (httpResp = null)
	return new Promise(resolve => {
		$.send(method, url, async (err, req, resp) => {
			try {
				httpReq = req
				httpResp = resp
				if (err) {
				} else {
					if (resp.body) {
						if (typeof resp.body == 'object') {
							httpResult = resp.body
						} else {
							try {
								httpResult = JSON.parse(resp.body)
							} catch (e) {
								httpResult = resp.body
							}
						}
					}
				}
			} catch (e) {
				console.log(e)
			} finally {
				resolve()
			}
		})
	})
}
