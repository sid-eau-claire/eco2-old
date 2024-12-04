// This script should be placed in your Strapi project's root directory.

const strapi = require('./node_modules/strapi/lib/index');

strapi(/* { dir: process.cwd(), autoReload: true } */).load().then(async instance => {
    // Use the name of your collection type in place of 'YourCollectionType'
    const entries = await instance.entityService.findMany('api::your-collection-type.your-collection-type');
    for (const entry of entries) {
        await instance.entityService.delete('api::your-collection-type.your-collection-type', entry.id);
    }
    console.log('All entries deleted.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
