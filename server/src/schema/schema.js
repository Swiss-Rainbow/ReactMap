import { GraphQLObjectType, GraphQLID, GraphQLFloat, GraphQLList, GraphQLSchema } from 'graphql'

import DeviceType from './device.js'
import GymType from './gym.js'
import PokestopType from './pokestop.js'
import PokemonType from './pokemon.js'
import SpawnpointType from './spawnpoint.js'
import { Device, Gym, Pokemon, Pokestop, Spawnpoint } from '../models/index.js'

const minMaxArgs = {
  minLat: { type: GraphQLFloat },
  maxLat: { type: GraphQLFloat },
  minLon: { type: GraphQLFloat },
  maxLon: { type: GraphQLFloat }
}

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    devices: {
      type: new GraphQLList(DeviceType),
      async resolve(parent, args) {
        return await Device.query()
      }
    },
    gyms: {
      type: new GraphQLList(GymType),
      args: minMaxArgs,
      async resolve(parent, args) {
        return await Gym.query()
          .whereBetween('lat', [args.minLat, args.maxLat])
          .andWhereBetween('lon', [args.minLon, args.maxLon])
          .andWhere('deleted', false)
          .andWhere('updated', '>', 0)
      }
    },
    pokestops: {
      type: new GraphQLList(PokestopType),
      args: minMaxArgs,
      async resolve(parent, args) {
        return await Pokestop.query()
          .whereBetween('lat', [args.minLat, args.maxLat])
          .andWhereBetween('lon', [args.minLon, args.maxLon])
          .andWhere('deleted', false)
          .andWhere('updated', '>', 0)
      }
    },
    pokemon: {
      type: new GraphQLList(PokemonType),
      args: minMaxArgs,
      async resolve(parent, args) {
        const ts = Math.floor((new Date).getTime() / 1000)
        return await Pokemon.query()
          .where('expire_timestamp', '>=', ts)
          .andWhereBetween('lat', [args.minLat, args.maxLat])
          .andWhereBetween('lon', [args.minLon, args.maxLon])
      }
    },
    pokemonDetails: {
      type: PokemonType,
      args: {
        id: { type: GraphQLID }
      },
      async resolve(parent, args) {
        const result = await Pokemon.query().findOne('id', args.id)
        result.greatLeague = JSON.parse(result.pvp_rankings_great_league)
        result.ultraLeague = JSON.parse(result.pvp_rankings_ultra_league)
        return result
      }
    },
    spawnpoints: {
      type: new GraphQLList(SpawnpointType),
      args: minMaxArgs,
      async resolve(parent, args) {
        return await Spawnpoint.query()
          .whereBetween('lat', [args.minLat, args.maxLat])
          .andWhereBetween('lon', [args.minLon, args.maxLon])
      }
    }
  }
})

export default new GraphQLSchema({ query: RootQuery })