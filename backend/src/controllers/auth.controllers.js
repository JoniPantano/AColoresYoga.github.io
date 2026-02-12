exports.register = async (req, res) => {
  const { email, password } = req.body;

  res.json({
    message: "Registro recibido",
    data: { email }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  res.json({
    message: "Login recibido",
    data: { email }
  });
};