module.exports = [
  {
    name: 'strapi::logger',
    config: {
      level: 'debug',
      exposeInContext: true,
      requests: true,
    },
  },  
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  // 'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: "strapi::body",
    config: {
      formLimit: "10mb", // modify form body
      jsonLimit: "10mb", // modify JSON body
      textLimit: "10mb", // modify text body
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'eaudashboard.s3.ca-west-1.amazonaws.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'dl.airtable.com',
            'eaudashboard.s3.ca-west-1.amazonaws.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  }
];
