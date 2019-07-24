require('dotenv').config()
const ngrok = require('ngrok')
const express = require('express')
const multer = require('multer')
const SiteClient = require('datocms-client').SiteClient
const upload = multer()
const checkSecret = require('./middlewares/checkSecret')
const parseData = require('./middlewares/parseData')
const { getVideoByIdBridTV, getVideoByIdDatoCMS } = require('./services')

const datoCMSclient = new SiteClient(process.env.DATOCMS_TOKEN)
global.datoCMSclient = datoCMSclient

const app = express()

app.use((req, res, next) => {
  if (req.body) console.info(req.body)
  if (req.params) console.info(req.params)
  if (req.query) console.info(req.query)
  console.info(`Received a ${req.method} request from ${req.ip} for ${req.url}`)
  next()
})

app.post('*', upload.none(), parseData, checkSecret)

app.post('/', async (req, res) => {
  try {
    const {
      method,
      data: {
        Video: { id },
      },
    } = req.data
    let videoBridTV = null
    let videoDatoCMS = null
    switch (method) {
      case 'edit_video':
        videoBridTV = await getVideoByIdBridTV(id[0])
        videoDatoCMS = await getVideoByIdDatoCMS(id[0])
        await datoCMSclient.items.update(videoDatoCMS.id, {
          title: videoBridTV.name,
          description: videoBridTV.description,
          image: videoBridTV.image,
          thumbnail: videoBridTV.thumbnail,
        })
        break
      case 'delete_video':
        videoBridTV = await getVideoByIdBridTV(id[0])
        videoDatoCMS = await getVideoByIdDatoCMS(id[0])
        await datoCMSclient.items.destroy(videoDatoCMS.id)
        break
      case 'video_encoded':
        videoBridTV = await getVideoByIdBridTV(id)
        await datoCMSclient.items.create({
          itemType: '107122',
          title: videoBridTV.name,
          description: videoBridTV.description,
          image: videoBridTV.image,
          thumbnail: videoBridTV.thumbnail,
          videoId: videoBridTV.id,
          playerId: '17794',
        })
        break
      default:
        break
    }
    return res.sendStatus(200)
  } catch (error) {
    console.log(error)
    return res.sendStatus(500)
  }
})

const server = app.listen(process.env.PORT, () => {
  console.log(`Express listening at port ${server.address().port}`)
})

ngrok
  .connect({
    proto: 'http',
    addr: process.env.PORT,
    authtoken: process.env.NGROK_TOKEN,
  })
  .then(url => {
    console.log(url)
  })
  .catch(error => {
    console.log(error)
  })
