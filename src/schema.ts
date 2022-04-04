import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext } from "./context";
import typeDefs from "./schema.graphql";
import { Pokemon, User, Prisma } from "@prisma/client";

import { APP_SECRET, SALT } from "./auth";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const resolvers = {
  Query: {
    info: () => 'Test',
    pokemon: async(
      parent: unknown,
      args: { filter?: string; 
        weightfrom?: number;
        weightto?: number;
        heightfrom?: number;
        heightto?: number;
        skip?: number; 
        take?: number,
        orderBy?: {
          name?: Prisma.SortOrder;
          height?: Prisma.SortOrder;
          weight?: Prisma.SortOrder
          createdAt?: Prisma.SortOrder;
        };
      },
      context: GraphQLContext
      ) => {
        const allowedPageCounts = [10, 20, 50];
        // default page items in the page is 10.
        const take = args.take && allowedPageCounts.includes(args.take) ? args.take : 10;

        const where = (args.filter || args.weightfrom || args.weightto || args.heightfrom || args.heightto)
          ? {
              AND: [
                { name: {contains: args.filter }},
                { weight: {gte: args.weightfrom }},
                { weight: {lte: args.weightto }},
                { height: {gte: args.heightfrom }},
                { height: {lte: args.heightto }},
              ],
            }
          : {};

      return context.prisma.pokemon.findMany({ 
        where,
        skip: args.skip,
        take: take,
        orderBy: args.orderBy,
      });
      
    },

    /**
     * check the existancy of user
     */ 
    check: (parent: unknown, args: {}, context: GraphQLContext) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }
      return context.currentUser;
    },
  },

  Pokemon: {
      id: (parent: Pokemon) => parent.id,
      name: (parent: Pokemon) => parent.name,
      height: (parent: Pokemon) => parent.height,
      weight: (parent: Pokemon) => parent.weight,
      imgUrl: (parent: Pokemon) => parent.imgUrl,
      description: (parent: Pokemon) => parent.description,
  },

  Mutation:{
    /**
     * saving new users to the system.
     */
      signup: async(
        parent: unknown,
        args: { email: string; password: string; name: string },
        context: GraphQLContext
      ) => {
        //hasing the password
        const password = await hash(args.password, SALT);

        // replace the argument password with hash password.
        // send data to create user.
        const user = await context.prisma.user.create({
          data: { ...args, password },
        });

        const token = sign({ userId: user.id }, APP_SECRET);

        return {
          token,
          user,
        };
      },

      /**
       * Login function.
       */
      login: async (
        parent: unknown,
        args: { email: string; password: string },
        context: GraphQLContext
      ) => {
        const user = await context.prisma.user.findUnique({
          where: { email: args.email },
        });
        if (!user) {
          throw new Error("No such user found");
        }

        const valid = await compare(args.password, user.password);
        if (!valid) {
          throw new Error("Invalid user details");
        }

        const token = sign({ userId: user.id }, APP_SECRET);

        return {
          token,
          user,
        };
      },

      /**
       * saving new pokemons to the system
       */ 
      pokemon: (
        parent: unknown, 
        args: { name: string, height: number, weight: number, imgUrl: string, description: string },
        context: GraphQLContext
        ) => {
          if (context.currentUser === null) {
            throw new Error("Unauthenticated!");
          }
          const newPokemon = context.prisma.pokemon.create({
            data:{
              name: args.name,
              height: args.height,
              weight: args.weight,
              imgUrl: args.imgUrl,
              description: args.description,
              createdBy: { connect: { id: context.currentUser.id } },
            },
          });
          return newPokemon;
      },

      /**
       * Updating pokemons.
       */
       patch_pokemons: (
        parent: unknown, 
        args: { id:number, name: string, height: number, weight: number, imgUrl: string, description: string },
        context: GraphQLContext
        ) => {
          if (context.currentUser === null) {
            throw new Error("Unauthenticated!");
          }
          const updatedPokemon = context.prisma.pokemon.update({
            where: {
              id: args.id,
            },
            data:{
              name: args.name,
              height: args.height,
              weight: args.weight,
              imgUrl: args.imgUrl,
              description: args.description,
              createdBy: { connect: { id: context.currentUser.id } },
            },
          });
          return updatedPokemon;
      },

      /**
       * Delete the pokemon
       */
       delete_pokemon: (
        parent: unknown, 
        args: { id:number },
        context: GraphQLContext
        ) => {
          if (context.currentUser === null) {
            throw new Error("Unauthenticated!");
          }
          const result = context.prisma.pokemon.delete({
            where: {
              id: args.id,
            },
          });
          return result;
      },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});