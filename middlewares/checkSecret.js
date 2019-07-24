const checkSecret = (req, res, next) => {
  const { secret } = req.data
  if (secret === process.env.WEBHOOK_SECRET) {
    return next()
  }
  return res.sendStatus(401)
}

module.exports = checkSecret
