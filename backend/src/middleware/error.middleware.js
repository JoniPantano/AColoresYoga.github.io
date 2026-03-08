const { ZodError } = require("zod");

function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Datos inválidos",
      errors: error.flatten().fieldErrors
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Error interno del servidor" });
}

module.exports = {
  errorHandler
};
