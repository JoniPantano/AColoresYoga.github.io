const { z } = require("zod");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const { hasAccessFromMembership } = require("../utils/membership");

const activateSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["MENSUAL", "ANUAL"]),
  startDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional()
});

const suspendSchema = z.object({
  notes: z.string().max(500).optional()
});

const planDurationDays = {
  MENSUAL: 30,
  ANUAL: 365
};

exports.activateMembership = async (req, res, next) => {
  try {
    const data = activateSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const startDate = data.startDate || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planDurationDays[data.plan]);

    const graceUntil = new Date(endDate);
    graceUntil.setDate(graceUntil.getDate() + env.GRACE_DAYS);

    const membership = await prisma.membership.create({
      data: {
        userId: data.userId,
        plan: data.plan,
        status: "ACTIVE",
        startDate,
        endDate,
        graceUntil,
        notes: data.notes,
        activatedById: req.user.id
      }
    });

    return res.status(201).json({
      message: "Membresía activada",
      membership
    });
  } catch (error) {
    return next(error);
  }
};

exports.suspendMembership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = suspendSchema.parse(req.body || {});

    const membership = await prisma.membership.findUnique({ where: { id } });

    if (!membership) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        suspendedById: req.user.id,
        notes: data.notes || membership.notes
      }
    });

    return res.json({
      message: "Membresía suspendida",
      membership: updated
    });
  } catch (error) {
    return next(error);
  }
};

exports.reactivateMembership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await prisma.membership.findUnique({ where: { id } });

    if (!membership) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: {
        status: "ACTIVE",
        suspendedById: null
      }
    });

    return res.json({
      message: "Membresía reactivada",
      membership: updated
    });
  } catch (error) {
    return next(error);
  }
};

exports.myMemberships = async (req, res, next) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ memberships });
  } catch (error) {
    return next(error);
  }
};

exports.myAccessStatus = async (req, res, next) => {
  try {
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"] }
      },
      orderBy: { endDate: "desc" }
    });

    const result = hasAccessFromMembership(membership);

    return res.json({
      ...result,
      membership
    });
  } catch (error) {
    return next(error);
  }
};

exports.adminListUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
};
