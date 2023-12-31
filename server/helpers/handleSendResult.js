const handleSendResult = (err, data, res) => {
  const obj = { data, error: null };
  let status = 200;
  if (err) {
    obj.error = err;
    status = err.status || 500;
  }
  res.status(status).json(obj);
};

module.exports = handleSendResult;
