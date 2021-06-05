import { gql } from 'apollo-server'
import { makeExecutableSchema } from 'apollo-server'
import { Context } from './context'
import { Prisma } from '@prisma/client'

const typeDefs = gql`
  type Query {
    getAllShoes: [Shoe!]
    getShoeById(shoeId: String!): Shoe!
    getAllTrendingShoes: [Shoe!]
    getAllSoldOutShoes: [Shoe!]
  }

  type Mutation {
    createAShoe(name: String!, price: Int!, isTrending: Boolean!, isSoldOut: Boolean!): Shoe!
    updateAShoe(shoeId: String!, name: String, price: Int, isTrending: Boolean, isSoldOut: Boolean): Shoe!
    markAShoeAsSoldOut(shoeId: String!): Shoe!
    deleteAShoe(shoeId: String!): Shoe!
  }

  type Shoe {
    shoeId: String!
    name: String!
    price: Int!
    isTrending: Boolean!
    isSoldOut: Boolean!
  }
`

const resolvers = {
  Query: {
    getAllShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany()

      return response
    },
    getShoeById: async (_obj: any, args: Prisma.ShoeWhereUniqueInput, context: Context, _info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.findUnique({
        where: {
          shoeId,
        },
      })

      return response
    },
    getAllTrendingShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany({
        where: {
          isTrending: true,
        },
      })

      return response
    },
    getAllSoldOutShoes: async (_obj: any, _args: any, context: Context, _info: any) => {
      const response = await context.prisma.shoe.findMany({
        where: {
          isSoldOut: true,
        },
      })

      return response
    },
  },
  Mutation: {
    createAShoe: async (_parent: any, args: Prisma.ShoeCreateInput, context: Context, info: any) => {
      const { name, price, isTrending, isSoldOut } = args

      const response = await context.prisma.shoe.create({
        data: {
          name,
          price,
          isTrending,
          isSoldOut,
        },
      })

      return response
    },
    updateAShoe: async (_parent: any, args: Prisma.ShoeCreateInput, context: Context, info: any) => {
      const { shoeId, name, price, isTrending, isSoldOut } = args

      const response = await context.prisma.shoe.update({
        where: {
          shoeId,
        },
        data: {
          name,
          price,
          isTrending,
          isSoldOut,
        },
      })

      return response
    },
    deleteAShoe: async (_parent: any, args: Prisma.ShoeWhereUniqueInput, context: Context, info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.delete({
        where: {
          shoeId,
        },
      })

      return response
    },
    markAShoeAsSoldOut: async (_parent: any, args: Prisma.ShoeWhereUniqueInput, context: Context, info: any) => {
      const { shoeId } = args

      const response = await context.prisma.shoe.update({
        where: {
          shoeId,
        },
        data: {
          isSoldOut: true, // mark shoe as sold out
        },
      })

      return response
    },
  },
}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
})
