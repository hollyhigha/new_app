export const cityList = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆',
  '武汉', '西安', '苏州', '南京', '天津', '郑州', '长沙',
  '东莞', '佛山', '宁波', '青岛', '沈阳', '昆明', '大连',
  '厦门', '福州', '无锡', '合肥', '济南', '温州', '哈尔滨',
  '南宁', '长春', '泉州', '石家庄', '贵阳', '南昌', '金华',
  '常州', '惠州', '嘉兴', '徐州', '太原', '珠海', '中山',
  '其他'
]

export const interestOptions = [
  { label: '眼袋', value: 'eye_bag' },
  { label: '双眼皮', value: 'double_eyelid' },
  { label: '皮肤管理', value: 'skin_care' },
  { label: '鼻部整形', value: 'nose' },
  { label: '面部轮廓', value: 'face' },
  { label: '口腔美容', value: 'dental' },
  { label: '形体塑造', value: 'body' },
  { label: '抗衰老', value: 'anti_aging' }
]

/**
 * 校验城市是否在白名单内
 */
export function isValidCity(city) {
  return cityList.includes(city)
}
