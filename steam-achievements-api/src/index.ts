import { createServer } from "@graphql-yoga/common";

export interface Env {
  STEAM_API_KEY: string;
}

class SteamApiClient {
  constructor(private apiKey: string) {}

  async getAchievements(gameId: string) {
    const searchParams = new URLSearchParams({
      appid: gameId,
      key: this.apiKey,
    });
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?${searchParams.toString()}`
    );
    return await response.json();
  }
}

const yoga = createServer<{ env: Env; ctx: ExecutionContext }>({
  schema: {
    // TODO: Improve schema, maybe using pothos?
    typeDefs: /* GraphQL */ `
      type Achievement {
        name: ID!
        displayName: String!
      }
      type Query {
        getAchievements(gameId: String!): [Achievement]!
      }
    `,
    resolvers: {
      Query: {
        async getAchievements(_, args, context) {
          const steam = new SteamApiClient(context.env.STEAM_API_KEY);
          // TODO: Improve types of steam api client
          const achievements: any = await steam.getAchievements(args.gameId);
          return achievements.game.availableGameStats.achievements;
        },
      },
    },
  },
});

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    return yoga.handleRequest(request, { env, ctx });
  },
};
