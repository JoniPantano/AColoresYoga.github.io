const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { signAccessToken } = require("../utils/jwt");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "ALUMNA"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

exports.register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role || "ALUMNA"
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Usuario creado",
      user
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email
    });

    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};
