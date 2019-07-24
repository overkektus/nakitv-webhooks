const axios = require('axios')

const getVideoByIdBridTV = async id => {
  const {
    data: { Video },
  } = await axios.get(`https://cms.brid.tv/services/get/video/1/${id}.json`)
  return Video[0]
}

const getVideoByIdDatoCMS = async id => {
  const { datoCMSclient } = global
  const records = await datoCMSclient.items.all({ 'filter[type]': 'video' }, { allPages: true })
  const result = records.filter(record => record.videoId == id)
  return result[0]
}

module.exports = { getVideoByIdBridTV, getVideoByIdDatoCMS }
