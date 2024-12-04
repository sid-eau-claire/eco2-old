'use strict';

/**
 * invitation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { parseMultipartData } = require('@strapi/utils')
const { sanitize } = require('@strapi/utils');
const { useDebugValue } = require('react');

const parseBody = ctx => {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx)
  }
  const { data } = ctx.request.body || {}
  return { data }
}

module.exports = createCoreController('api::invitation.invitation', {
  async updateMyInvitation(ctx) {
    const user = ctx.state.user;
    let invitationId = null;
    let updatedInvitation = null;
    let manager = null;
    const existingInvitation = await strapi.entityService.findMany('api::invitation.invitation', {
      filters: { inviteEmail: user.email },
      populate: {
        inviter: {
          plugin: 'users-permissions',
          model: 'user',
          populate: {
            profile: {
              plugin: 'profile',
              model: 'profile',
            },
          },
        }
      },
    });

    if (existingInvitation.length > 0) {
      invitationId = existingInvitation[0].id;
      const {data, files} = parseBody(ctx)
      updatedInvitation = await strapi.entityService.update('api::invitation.invitation', invitationId, {
        data: {
          ...data, id: invitationId,
        },
        files
      })
      // updatedInvitation = await super.update(ctx, invitationId);
      console.log('find the invitation for user to update')
      manager = existingInvitation[0].inviter.profile.id 
      // console.log(updatedInvitation)
    } else {
      updatedInvitation = await super.create(ctx, invitationId);
      invitationId = updatedInvitation.data.id;
      const newInvitation = await strapi.entityService.findMany('api::invitation.invitation', {
        filters: { inviteEmail: user.email },
        populate: {
          inviter: {
            plugin: 'users-permissions',
            model: 'user',
            populate: {
              profile: {
                plugin: 'profile',
                model: 'profile',
              },
            },
          }
        },
      });
      manager = newInvitation[0].inviter.profile.id  
    }
    // const manager = await strapi.entityService.findMany('api::user-permission', {
    //   filters: { owner: user.id },
    // });
    // })

    const existingProfile = await strapi.entityService.findMany('api::profile.profile', {
      filters: { owner: user.id },
    });
    if (existingProfile.length > 0) {
      const profileId = existingProfile[0].id;
      const updatedProfile = await strapi.entityService.update('api::profile.profile', profileId, {
        data: {
          firstName: ctx.request.body.data.inviteFirstName,
          lastName: ctx.request.body.data.inviteLastName,
          middleName: ctx.request.body.data.inviteMiddleName,
          nickName: ctx.request.body.data.inviteNickName,
          mobilePhone: ctx.request.body.data.inviteMobilePhone,
          homeProvince: ctx.request.body.data.inviteHomeProvince,
          homeCity: ctx.request.body.data.inviteHomeCity,
          homeAddress: ctx.request.body.data.inviteHomeAddress,
          mailProvince: ctx.request.body.data.inviteMailProvince || ctx.request.body.data.inviteHomeProvince,
          mailCity: ctx.request.body.data.inviteMailCity || ctx.request.body.data.inviteHomeCity,
          mailAddress: ctx.request.body.data.inviteMailAddress  || ctx.request.body.data.inviteHomeAddress,
          dateOfBirth: ctx.request.body.data.inviteDateOfBirth,
          // manager: ctx.request.body.data.inviter,
          previousCompany: ctx.request.body.data.invitePreviousCompany,
          examResults: ctx.request.body.data.inviteExamResults,
          currentLicense: ctx.request.body.data.inviteCurrentLicense,
          eoLicense: ctx.request.body.data.inviteEoLicense,
          status: ctx.request.body.data.status == 'completed' ? 'completed' : 'new',
          manager: manager,
        },
      });
      // return updatedProfile;
    } else {
      // const newProfile = await super.create(ctx);
      const updatedProfile = await strapi.entityService.create('api::profile.profile', {
        data: {
          owner: user.id,
          firstName: ctx.request.body.data.inviteFirstName,
          lastName: ctx.request.body.data.inviteLastName,
          middleName: ctx.request.body.data.inviteMiddleName,
          nickName: ctx.request.body.data.inviteNickName,
          mobilePhone: ctx.request.body.data.inviteMobilePhone,
          homeProvince: ctx.request.body.data.inviteHomeProvince,
          homeCity: ctx.request.body.data.inviteHomeCity,
          homeAddress: ctx.request.body.data.inviteHomeAddress, 
          mailProvince: ctx.request.body.data.inviteMailProvince || ctx.request.body.data.inviteHomeProvince,
          mailCity: ctx.request.body.data.inviteMailCity || ctx.request.body.data.inviteHomeCity,
          mailAddress: ctx.request.body.data.inviteMailAddress  || ctx.request.body.data.inviteHomeAddress,
          dateOfBirth: ctx.request.body.data.inviteDateOfBirth,
          // manager: ctx.request.body.data.inviter,
          previousCompany: ctx.request.body.data.invitePreviousCompany,
          examResults: ctx.request.body.data.inviteExamResults,
          currentLicense: ctx.request.body.data.inviteCurrentLicense,
          eoLicense: ctx.request.body.data.inviteEoLicense,
          status: ctx.request.body.data.status == 'completed' ? 'completed' : 'new',
        },
      });
    }
    return updatedInvitation
  }
});



