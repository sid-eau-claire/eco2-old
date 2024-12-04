// path: src/api/passwordresettoken/controllers/passwordresettoken.js

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::passwordresettoken.passwordresettoken', ({ strapi }) => ({
  async createResetToken(ctx) {
    console.log("Received request body:", ctx.request.body);
    const { data } = ctx.request.body;
    console.log("Data from request:", data);
  
    if (!data || !data.email) {
      return ctx.badRequest('Email is required');
    }
  
    const { email } = data;
    console.log("Email extracted:", email);
    
    // Check if the user exists
    const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email } });

    if (!user) {
      return ctx.badRequest('User not found');
    }

    // Generate a random token
    const token = require('crypto').randomBytes(20).toString('hex');

    // Set expiration to 2 minutes from now
    const expireAt = new Date(Date.now() + 2 * 60 * 1000);

    // Create or update the password reset token
    const existingToken = await strapi.db.query('api::passwordresettoken.passwordresettoken').findOne({ where: { email } });

    if (existingToken) {
      await strapi.db.query('api::passwordresettoken.passwordresettoken').update({
        where: { id: existingToken.id },
        data: { token, expireAt }
      });
    } else {
      await strapi.db.query('api::passwordresettoken.passwordresettoken').create({
        data: { email, token, expireAt }
      });
    }

    return { message: 'Reset token created successfully', token: token };
  },

  async resetPassword(ctx) {
    try {
      console.log("Received reset password request. Body:", ctx.request.body);

      let data;
      try {
        const parsedBody = JSON.parse(ctx.request.body);
        data = parsedBody.data;
      } catch (error) {
        console.error("Error parsing request body:", error);
        return ctx.badRequest('Invalid request body');
      }
      
      console.log("Data from request:", data);
      
      if (!data || !data.code || !data.password || !data.passwordConfirmation) {
        console.log("Missing required fields");
        return ctx.badRequest('Code, password, and password confirmation are required');
      }
  
      const { code, password, passwordConfirmation } = data;
      console.log("Received reset password request for code:", code);
  
      if (password !== passwordConfirmation) {
        console.log("Passwords do not match");
        return ctx.badRequest('Passwords do not match');
      }
  
      // Find the token
      let resetToken;
      try {
        resetToken = await strapi.db.query('api::passwordresettoken.passwordresettoken').findOne({ 
          where: { token: code }
        });
        console.log("Found reset token:", resetToken);
      } catch (error) {
        console.error("Error finding reset token:", error);
        return ctx.internalServerError('Error finding reset token');
      }
  
      if (!resetToken) {
        console.log("Invalid reset token");
        return ctx.badRequest('Invalid reset token');
      }
  
      if (new Date(resetToken.expireAt) < new Date()) {
        console.log("Reset token has expired");
        return ctx.badRequest('Reset token has expired');
      }
  
      // Find the user
      let user;
      try {
        user = await strapi.query('plugin::users-permissions.user').findOne({ 
          where: { email: resetToken.email }
        });
        console.log("Found user:", user?.id);
      } catch (error) {
        console.error("Error finding user:", error);
        return ctx.internalServerError('Error finding user');
      }
  
      if (!user) {
        console.log("User not found for email:", resetToken.email);
        return ctx.badRequest('User not found');
      }
  
      // Update the user's password
      try {
        await strapi.plugins['users-permissions'].services.user.edit(user.id, { password });
        console.log("Password updated for user:", user.id);
      } catch (error) {
        console.error("Error updating password:", error);
        return ctx.internalServerError('Error updating password');
      }
  
      // Delete the used token
      try {
        await strapi.db.query('api::passwordresettoken.passwordresettoken').delete({ 
          where: { id: resetToken.id }
        });
        console.log("Reset token deleted");
      } catch (error) {
        console.error("Error deleting reset token:", error);
        // We don't return here as the password has been reset successfully
      }
  
      console.log("Password reset successfully for user:", user.id);
      return ctx.send({ message: 'Password reset successfully' });
    } catch (error) {
      console.error("Unexpected error in resetPassword:", error);
      return ctx.internalServerError('An unexpected error occurred while resetting the password');
    }
  }
}));