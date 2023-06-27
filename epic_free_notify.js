/**
 * cron: 0 21 10 * 5
 *
 * epic 每周免费游戏通知
 *
 */
const $ = new Env('Epic免费游戏查询')

!(async () => {
	const url = 'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=zh-CN'

	const axios = require('axios')

	const notify = require('./sendNotify')

	try {
		const data = await axios.get(url)

		data.data.data.Catalog.searchStore.elements.forEach(({ title, promotions }) => {
			// 判断是否本周免费
			if (promotions) {
				// 本周促销
				promotions.promotionalOffers.forEach(offers => {
					const { startDate, endDate } = offers.promotionalOffers[0]

					$.log(`游戏名称:${title} \n 促销开始时间:${startDate} \n 促销结束时间${endDate} \n`, { notify: true })
				})
				// 即将促销活动
				// promotions.upcomingPromotionalOffers
			}
		})
	} catch (error) {
		$.log(error)
	}
})()
	.catch(e => $.log(e))
	.finally(() => $.exitNow())

function Env(name) {
	return new (class {
		constructor(name) {
			this.name = name
			this.startTime = Date.now()
			this.log(`🔔${this.name}, 开始运行!\n`, { time: true })
			this.notifyStr = []
			this.notifyFlag = true
			this.userIdx = 0
			this.userList = []
			this.userCount = 0
		}
		log(msg, options = {}) {
			let opt = { console: true }
			Object.assign(opt, options)
			if (opt.time) {
				let fmt = opt.fmt || 'hh:mm:ss'
				msg = `[${this.time(fmt)}]` + msg
			}
			if (opt.notify) this.notifyStr.push(msg)
			if (opt.console) console.log(msg)
		}
		read_env(Class) {
			let envStrList = ckNames.map(x => process.env[x])
			for (let env_str of envStrList.filter(x => !!x)) {
				let sp = envSplitor.filter(x => env_str.includes(x))
				let splitor = sp.length > 0 ? sp[0] : envSplitor[0]
				for (let ck of env_str.split(splitor).filter(x => !!x)) {
					this.userList.push(new Class(ck))
				}
			}
			this.userCount = this.userList.length
			if (!this.userCount) {
				this.log(`未找到变量， 请检查变量${ckNames.map(x => '[' + x + ']').join('或')}`, { notify: true })
				return false
			}
			this.log(`共找到${this.userCount}个账号`)
			return true
		}
		async threads(taskName, conf, opt = {}) {
			while (conf.idx < $.userList.length) {
				let user = $.userList[conf.idx++]
				if (!user.valid) continue
				await user[taskName](opt)
			}
		}
		async threadTask(taskName, thread) {
			let taskAll = []
			let taskConf = { idx: 0 }
			while (thread--) taskAll.push(this.threads(taskName, taskConf))
			await Promise.all(taskAll)
		}
		time(t, x = null) {
			let xt = x ? new Date(x) : new Date()
			let e = {
				'M+': xt.getMonth() + 1,
				'd+': xt.getDate(),
				'h+': xt.getHours(),
				'm+': xt.getMinutes(),
				's+': xt.getSeconds(),
				'q+': Math.floor((xt.getMonth() + 3) / 3),
				S: this.padStr(xt.getMilliseconds(), 3)
			}
			;/(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + '').substr(4 - RegExp.$1.length)))
			for (let s in e)
				new RegExp('(' + s + ')').test(t) &&
					(t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ('00' + e[s]).substr(('' + e[s]).length)))
			return t
		}
		async showmsg() {
			if (!this.notifyFlag) return
			if (!this.notifyStr.length) return

			this.log('\n============== 📣 推送开始 📣 ==============')
			await notify.sendNotify(this.name, this.notifyStr.join('\n'))
			this.log('\n============== 📣 推送结束 📣 ==============')
		}
		padStr(num, length, opt = {}) {
			let padding = opt.padding || '0'
			let mode = opt.mode || 'l'
			let numStr = String(num)
			let numPad = length > numStr.length ? length - numStr.length : 0
			let pads = ''
			for (let i = 0; i < numPad; i++) {
				pads += padding
			}
			if (mode == 'r') {
				numStr = numStr + pads
			} else {
				numStr = pads + numStr
			}
			return numStr
		}
		json2str(obj, c, encode = false) {
			let ret = []
			for (let keys of Object.keys(obj).sort()) {
				let v = obj[keys]
				if (v && encode) v = encodeURIComponent(v)
				ret.push(keys + '=' + v)
			}
			return ret.join(c)
		}
		str2json(str, decode = false) {
			let ret = {}
			for (let item of str.split('&')) {
				if (!item) continue
				let idx = item.indexOf('=')
				if (idx == -1) continue
				let k = item.substr(0, idx)
				let v = item.substr(idx + 1)
				if (decode) v = decodeURIComponent(v)
				ret[k] = v
			}
			return ret
		}
		randomPattern(pattern, charset = 'abcdef0123456789') {
			let str = ''
			for (let chars of pattern) {
				if (chars == 'x') {
					str += charset.charAt(Math.floor(Math.random() * charset.length))
				} else if (chars == 'X') {
					str += charset.charAt(Math.floor(Math.random() * charset.length)).toUpperCase()
				} else {
					str += chars
				}
			}
			return str
		}
		randomString(len, charset = 'abcdef0123456789') {
			let str = ''
			for (let i = 0; i < len; i++) {
				str += charset.charAt(Math.floor(Math.random() * charset.length))
			}
			return str
		}
		randomList(a) {
			let idx = Math.floor(Math.random() * a.length)
			return a[idx]
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		async exitNow() {
			await this.showmsg()
			let e = Date.now()
			let s = (e - this.startTime) / 1000
			this.log('')
			this.log(`🔔${this.name}, 运行结束, 共运行了 🕛 ${s}秒`, { time: true })
			process.exit(0)
		}
	})(name)
}
