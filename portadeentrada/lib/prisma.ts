import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Models that have the deletedAt field for soft delete
const SOFT_DELETE_MODELS = ['ProgramaCultural', 'Inscricao']

function modelHasSoftDelete(model: string): boolean {
  return SOFT_DELETE_MODELS.includes(model)
}

const prismaClient = globalForPrisma.prisma ?? new PrismaClient()

export const prisma = prismaClient.$extends({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        if (modelHasSoftDelete(model)) {
          if (args.where) {
            args.where = { ...args.where, deletedAt: null }
          } else {
            args.where = { deletedAt: null }
          }
        }
        return query(args)
      },
      async findFirst({ model, operation, args, query }) {
        if (modelHasSoftDelete(model)) {
          if (args?.where) {
            args.where = { ...args.where, deletedAt: null }
          } else if (args) {
            args.where = { deletedAt: null }
          } else {
            args = { where: { deletedAt: null } }
          }
        }
        return query(args)
      },
      async findUnique({ model, operation, args, query }) {
        if (modelHasSoftDelete(model) && args?.where) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
      async count({ model, operation, args, query }) {
        if (modelHasSoftDelete(model)) {
          if (args?.where) {
            args.where = { ...args.where, deletedAt: null }
          } else if (args) {
            args.where = { deletedAt: null }
          } else {
            args = { where: { deletedAt: null } }
          }
        }
        return query(args)
      },
      async aggregate({ model, operation, args, query }) {
        if (modelHasSoftDelete(model)) {
          if (args?.where) {
            args.where = { ...args.where, deletedAt: null }
          } else if (args) {
            args.where = { deletedAt: null }
          } else {
            args = { where: { deletedAt: null } }
          }
        }
        return query(args)
      },
      async groupBy({ model, operation, args, query }) {
        if (modelHasSoftDelete(model) && args?.where) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
      async delete({ model, operation, args, query }) {
        // Soft delete: update deletedAt instead of actual delete
        if (modelHasSoftDelete(model) && args?.where) {
          const modelDelegate = prismaClient[model as keyof typeof prismaClient] as unknown as {
            update: (args: { where: Record<string, unknown>; data: { deletedAt: Date } }) => Promise<unknown>
          }
          return modelDelegate.update({
            where: args.where,
            data: { deletedAt: new Date() },
          })
        }
        return query(args)
      },
      async deleteMany({ model, operation, args, query }) {
        // Soft delete many
        if (modelHasSoftDelete(model) && args?.where) {
          const modelDelegate = prismaClient[model as keyof typeof prismaClient] as unknown as {
            updateMany: (args: { where: Record<string, unknown>; data: { deletedAt: Date } }) => Promise<unknown>
          }
          return modelDelegate.updateMany({
            where: { ...args.where, deletedAt: null },
            data: { deletedAt: new Date() },
          })
        }
        return query(args)
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export default prisma