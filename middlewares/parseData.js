const parseData = (req, res, next) => {
  const parsedFormData = JSON.parse(req.body.data)
  req.data = parsedFormData
  console.log(parsedFormData)
  next()
}

module.exports = parseData
