module.exports = {
  index: async (ctx) => {
    const now = new Date();
    ctx.body = {
      serverTime: now.toISOString(),
      serverTimeString: now.toString(),
      timezoneOffset: now.getTimezoneOffset()
    };
  },
};