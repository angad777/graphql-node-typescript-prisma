import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const main = async () => {
  const nike = await prisma.shoe.create({
    data: {
      name: 'Nike ',
      price: 140,
      isTrending: true,
      isSoldOut: false,
    },
  })

  const addidas = await prisma.shoe.create({
    data: {
      name: 'Adidas',
      price: 160,
      isTrending: false,
      isSoldOut: false,
    },
  })

  const timberland = await prisma.shoe.create({
    data: {
      name: 'Timberland',
      price: 240,
      isTrending: false,
      isSoldOut: true,
    },
  })
  console.log({ nike, addidas, timberland })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
