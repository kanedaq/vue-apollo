const DEBUG_MODE = false

////////////////////////////////////////////////////////////////
// デバッグ用コード。デバッグ時に /root/www/debug.log にログを出力する。
////////////////////////////////////////////////////////////////
const log4js = require('log4js')
const util = require('util')

log4js.configure({
  appenders : {
    debug : {type : 'file', filename : '/root/www/debug.log'}
  },
  categories : {
    default : {appenders : ['debug'], level : 'debug'},
  }
});
var logger = log4js.getLogger('debug');

////////////////////////////////////////////////////////////////
// 以下、https://www.graphile.org/postgraphile/subscriptions/ の
// MySubscriptionPlugin.jsを改変
////////////////////////////////////////////////////////////////
const { makeExtendSchemaPlugin, gql, embed } = require("graphile-utils");

const makeTopic = (_args, context, _resolveInfo) => {
  if (DEBUG_MODE) {
    logger.debug('makeTopic() in');
    logger.debug('_args = ');
    logger.debug(util.inspect(_args));
    logger.debug('context = ');
    logger.debug(util.inspect(context));

    // デバッグ時に、JWTが渡されなくてもSubscriptionを有効にしたいなら、ここでreturn
    return `graphql:message:${_args.channelId}`;
  }

  if (context.jwtClaims.user_id) {
    return `graphql:message:${_args.channelId}`;
  } else {
    throw new Error("You're not logged in");
  }
};

module.exports = makeExtendSchemaPlugin(({ pgSql: sql }) => ({
  typeDefs: gql`
    type MessageChanged {
      # This is returned directly from the PostgreSQL subscription payload (JSON object)
      type: String!

      # This is populated by our resolver below
      message: Message

      # This is returned directly from the PostgreSQL subscription payload (JSON object)
      oldrec: MessageNullable
    }

    extend type Subscription {
      messageChanged (channelId: String!): MessageChanged! @pgSubscription(topic: ${embed(
        makeTopic
      )})
    }
  `,

  resolvers: {
    MessageChanged: {
      // This method finds the user from the database based on the event
      // published by PostgreSQL.
      //
      // In a future release, we hope to enable you to replace this entire
      // method with a small schema directive above, should you so desire. It's
      // mostly boilerplate.

      async message(
        event,
        _args,
        _context,
        {
          graphile: { selectGraphQLResultFromTable },
        }
      ) {

        if (DEBUG_MODE) {
          logger.debug('message() in');
          logger.debug('event = ');
          logger.debug(util.inspect(event));
        }

        if (event.type === 'DELETE') {
          return null;
        }

        const rows = await selectGraphQLResultFromTable(
          sql.fragment`apollo_demo.messages`,
          (tableAlias, sqlBuilder) => {

            if (DEBUG_MODE) {
              logger.debug('selectGraphQLResultFromTable() in');
            }

            sqlBuilder.where(
              sql.fragment`${sqlBuilder.getTableAlias()}.id = ${sql.value(
                event.newrec.id
              )}`
            );
          }
        );

        if (DEBUG_MODE) {
          logger.debug('rows = ');
          logger.debug(util.inspect(rows));
        }
        return rows[0];
      },

    },
  },
}));
