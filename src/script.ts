import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  const newPokemon = await prisma.pokemon.create({
    data: {
      name: 'Pokemon1',
      height: 12.4,
      weight: 10.5,
      imgUrl: 'www.thisurl.io/images/pokemon1',
      description: 'sample pokemon description',
    }
  });
  const allPokemons = await prisma.pokemon.findMany();
  console.log(allPokemons);
}


main()
  .catch(e => {
    throw e
  }).finally(async () => {
    await prisma.$disconnect()
  })