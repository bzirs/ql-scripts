/**
 * cron: 21 10 * * 5
 *
 * epic 每周免费游戏通知
 *
 */
const Env = require('./Env')
const $ = new Env('Epic免费游戏查询')

const { request } = require('./utils')

!(async () => {
	const url = 'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=zh-CN'

	const infoUrl = 'https://store.epicgames.com/zh-CN/p/'

	try {
		const { data } = await request({
			url
		})

		data.Catalog.searchStore.elements.forEach(({ title, promotions, productSlug }) => {
			// 判断是否本周免费
			if (promotions) {
				// 本周促销
				promotions.promotionalOffers.forEach(offers => {
					const { startDate, endDate } = offers.promotionalOffers[0]

					$.log(
						`游戏名称:${title} \n 促销开始时间:${$.time('yyyy-MM-dd hh:mm:ss', startDate)} \n 促销结束时间${$.time(
							'yyyy-MM-dd hh:mm:ss',
							endDate
						)} \n 前往领取: ${infoUrl + productSlug}`,
						{
							notify: true
						}
					)
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
