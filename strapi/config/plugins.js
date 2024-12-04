const article = require("../src/api/article/controllers/article");

module.exports = ({env}) => ({
  // upload: {
  //   config: {
  //     sizeLimit: 40 * 1024 * 1024, // 40mb in bytes
  //     providerOptions: {
  //       localServer: {
  //         maxage: 300000
  //       },
  //     },
  //   },
  // },
  logger: {
    level: 'debug',
    exposeInContext: true,
    requests: true,
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        rootPath: env('AWS_S3_ROOT_PATH', 'uploads'),
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey:env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION'),
          params: {
            // ACL: env('AWS_ACL', 'public-read'),
            ACL: 'private',
            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES',60 * 60 * 24 * 6),
            Bucket:  env('AWS_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },  
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 10,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
  'drag-drop-content-types': {
    enabled: true
  },
  comments: {
    enabled: true,
    config: {
      badWords: false,
      moderatorRoles: ["Authenticated"],
      approvalFlow: ["api::page.page"],
      entryLabel: {
        "*": ["Title", "title", "Name", "name", "Subject", "subject"],
        "api::page.page": ["MyField"],
      },
      blockedAuthorProps: ["name", "email"],
      reportReasons: {
        MY_CUSTOM_REASON: "MY_CUSTOM_REASON",
      },
      gql: {
        // ...
      },
    },
  },  
});