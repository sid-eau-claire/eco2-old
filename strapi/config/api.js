module.exports = {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
};


// module.exports = {
//   rest: {
//     defaultLimit: 25,
//     maxLimit: 100,
//     withCount: true,
//   },
//   api: {
//     autoReload: true,
//     responses: {
//       privateAttributes: [],
//     },
//   },
//   core: {
//     lifecycle: {
//       beforeCreate: [
//         { handler: (event) => {
//           if (event.params.data.createdAt) {
//             event.params.data.createdAt = new Date(event.params.data.createdAt);
//           }
//           if (event.params.data.updatedAt) {
//             event.params.data.updatedAt = new Date(event.params.data.updatedAt);
//           }
//         }}
//       ],
//       beforeUpdate: [
//         { handler: (event) => {
//           if (event.params.data.updatedAt) {
//             event.params.data.updatedAt = new Date(event.params.data.updatedAt);
//           }
//         }}
//       ]
//     }
//   }
// };
