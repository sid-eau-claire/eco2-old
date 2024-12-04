import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginCommentsComment extends Schema.CollectionType {
  collectionName: 'comments_comment';
  info: {
    tableName: 'plugin-comments-comments';
    singularName: 'comment';
    pluralName: 'comments';
    displayName: 'Comment';
    description: 'Comment content type';
    kind: 'collectionType';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    content: Attribute.Text & Attribute.Required;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    blockedThread: Attribute.Boolean & Attribute.DefaultTo<false>;
    blockReason: Attribute.String;
    authorUser: Attribute.Relation<
      'plugin::comments.comment',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    authorId: Attribute.String;
    authorName: Attribute.String;
    authorEmail: Attribute.Email;
    authorAvatar: Attribute.String;
    isAdminComment: Attribute.Boolean;
    removed: Attribute.Boolean;
    approvalStatus: Attribute.String;
    related: Attribute.String;
    reports: Attribute.Relation<
      'plugin::comments.comment',
      'oneToMany',
      'plugin::comments.comment-report'
    >;
    threadOf: Attribute.Relation<
      'plugin::comments.comment',
      'oneToOne',
      'plugin::comments.comment'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::comments.comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::comments.comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginCommentsCommentReport extends Schema.CollectionType {
  collectionName: 'comments_comment-report';
  info: {
    tableName: 'plugin-comments-reports';
    singularName: 'comment-report';
    pluralName: 'comment-reports';
    displayName: 'Reports';
    description: 'Reports content type';
    kind: 'collectionType';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    content: Attribute.Text;
    reason: Attribute.Enumeration<['BAD_LANGUAGE', 'DISCRIMINATION', 'OTHER']> &
      Attribute.Required &
      Attribute.DefaultTo<'OTHER'>;
    resolved: Attribute.Boolean & Attribute.DefaultTo<false>;
    related: Attribute.Relation<
      'plugin::comments.comment-report',
      'manyToOne',
      'plugin::comments.comment'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::comments.comment-report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::comments.comment-report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    profile: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::profile.profile'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAccountAccount extends Schema.CollectionType {
  collectionName: 'accounts';
  info: {
    singularName: 'account';
    pluralName: 'accounts';
    displayName: 'account';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    profileId: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'api::profile.profile'
    >;
    name: Attribute.String;
    balance: Attribute.Decimal;
    hold: Attribute.Decimal;
    accountTransactionIds: Attribute.Relation<
      'api::account.account',
      'oneToMany',
      'api::accounttransaction.accounttransaction'
    >;
    paymentPeriodIds: Attribute.Relation<
      'api::account.account',
      'manyToMany',
      'api::paymentperiod.paymentperiod'
    >;
    type: Attribute.Enumeration<['advisor']>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAccounttransactionAccounttransaction
  extends Schema.CollectionType {
  collectionName: 'accounttransactions';
  info: {
    singularName: 'accounttransaction';
    pluralName: 'accounttransactions';
    displayName: 'accounttransaction';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    accountId: Attribute.Relation<
      'api::accounttransaction.accounttransaction',
      'manyToOne',
      'api::account.account'
    >;
    amount: Attribute.Decimal;
    newBalance: Attribute.Decimal;
    amountHold: Attribute.Decimal;
    newHoldBalance: Attribute.Decimal;
    discriminator: Attribute.String;
    description: Attribute.String;
    type: Attribute.Enumeration<
      ['commission', 'payroll', 'escrow release', 'credit', 'debt']
    > &
      Attribute.Required;
    statementLog: Attribute.Component<'information.statement-log', true>;
    reversalOfId: Attribute.Integer;
    paymentPeriodId: Attribute.Relation<
      'api::accounttransaction.accounttransaction',
      'oneToOne',
      'api::paymentperiod.paymentperiod'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::accounttransaction.accounttransaction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::accounttransaction.accounttransaction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAdvisortargetAdvisortarget extends Schema.CollectionType {
  collectionName: 'advisortargets';
  info: {
    singularName: 'advisortarget';
    pluralName: 'advisortargets';
    displayName: 'advisortarget';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    profileId: Attribute.Relation<
      'api::advisortarget.advisortarget',
      'manyToOne',
      'api::profile.profile'
    >;
    year: Attribute.Integer;
    month: Attribute.Integer;
    noCoreApp: Attribute.Integer;
    coreMPE: Attribute.Integer;
    noInvestmentApp: Attribute.Integer;
    investmentAUM: Attribute.Integer;
    noSettledRevenue: Attribute.Integer;
    settledRevenue: Attribute.Integer;
    noOfSubscription: Attribute.Integer;
    noOfLicensed: Attribute.Integer;
    status: Attribute.Enumeration<
      ['Waiting for Approval', 'Approved', 'Reject']
    >;
    MPProfileId: Attribute.Relation<
      'api::advisortarget.advisortarget',
      'oneToOne',
      'api::profile.profile'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::advisortarget.advisortarget',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::advisortarget.advisortarget',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiArticleArticle extends Schema.CollectionType {
  collectionName: 'articles';
  info: {
    singularName: 'article';
    pluralName: 'articles';
    displayName: 'article';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    menu: Attribute.Enumeration<
      ['guidelines', 'marketing', 'resources', 'education']
    >;
    subMenu: Attribute.String;
    topic: Attribute.String;
    seq: Attribute.Integer;
    summary: Attribute.Text;
    showInDashboard: Attribute.Boolean & Attribute.DefaultTo<false>;
    content: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    photo: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCarrierCarrier extends Schema.CollectionType {
  collectionName: 'carriers';
  info: {
    singularName: 'carrier';
    pluralName: 'carriers';
    displayName: 'carrier';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    carrierName: Attribute.String;
    photo: Attribute.Media;
    summary: Attribute.Text;
    showInDashboard: Attribute.Boolean;
    content: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    title: Attribute.String;
    focus: Attribute.Boolean;
    bgColor: Attribute.String;
    textColor: Attribute.String;
    sequence: Attribute.Integer;
    products: Attribute.Component<'information.product', true>;
    documents: Attribute.Component<'information.document', true>;
    contacts: Attribute.RichText;
    training: Attribute.Component<'information.training', true>;
    contracting: Attribute.JSON;
    productIds: Attribute.Relation<
      'api::carrier.carrier',
      'oneToMany',
      'api::product.product'
    >;
    logoUrl: Attribute.String;
    order: Attribute.Integer;
    tier: Attribute.Integer;
    defaultCarrierBonus: Attribute.Decimal;
    deactivatedAt: Attribute.Date;
    bonusMarkupPercent: Attribute.Decimal;
    fundCategoryTypeIds: Attribute.Relation<
      'api::carrier.carrier',
      'oneToMany',
      'api::fundcategorytype.fundcategorytype'
    >;
    carrierVideoId1: Attribute.String;
    carrierVideoId2: Attribute.String;
    carrierVideoId3: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::carrier.carrier',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::carrier.carrier',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCarriertrainingCarriertraining
  extends Schema.CollectionType {
  collectionName: 'carriertrainings';
  info: {
    singularName: 'carriertraining';
    pluralName: 'carriertrainings';
    displayName: 'carriertraining';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    carrierId: Attribute.Relation<
      'api::carriertraining.carriertraining',
      'oneToOne',
      'api::carrier.carrier'
    >;
    productType: Attribute.Component<'information.type', true>;
    ProductItem: Attribute.Component<'information.product-item', true>;
    url: Attribute.String;
    topic: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::carriertraining.carriertraining',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::carriertraining.carriertraining',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitsagentCitsagent extends Schema.CollectionType {
  collectionName: 'citsagents';
  info: {
    singularName: 'citsagent';
    pluralName: 'citsagents';
    displayName: 'Cits Agent';
    description: 'Represents agents with their carrier codes and statuses';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    fullname: Attribute.String & Attribute.Required;
    agentid: Attribute.String & Attribute.Required;
    carriercode: Attribute.String & Attribute.Required;
    carriername: Attribute.String;
    carrierappstatus: Attribute.String;
    citsclients: Attribute.Relation<
      'api::citsagent.citsagent',
      'manyToMany',
      'api::citsclient.citsclient'
    >;
    citspolicies: Attribute.Relation<
      'api::citsagent.citsagent',
      'manyToMany',
      'api::citspolicy.citspolicy'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citsagent.citsagent',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citsagent.citsagent',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitsclientCitsclient extends Schema.CollectionType {
  collectionName: 'citsclients';
  info: {
    singularName: 'citsclient';
    pluralName: 'citsclients';
    displayName: 'Cits Client';
    description: 'Represents clients with detailed personal and contact information.';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    clientid: Attribute.String & Attribute.Required & Attribute.Unique;
    carriercode: Attribute.String & Attribute.Required;
    party_type_code: Attribute.String;
    first_name: Attribute.String;
    last_name: Attribute.String;
    occupation: Attribute.String;
    gender: Attribute.String;
    birth_date: Attribute.Date;
    address_type_code: Attribute.String;
    line1: Attribute.String;
    city: Attribute.String;
    state_code: Attribute.String;
    zip: Attribute.String;
    country_code: Attribute.String;
    phone_type_code: Attribute.String;
    phone_country_code: Attribute.String;
    area_code: Attribute.String;
    dial_number: Attribute.String;
    preferred_language: Attribute.String;
    email_type: Attribute.String;
    email_address: Attribute.Email;
    agentid: Attribute.String;
    agentIds: Attribute.Relation<
      'api::citsclient.citsclient',
      'manyToMany',
      'api::citsagent.citsagent'
    >;
    citspolicies: Attribute.Relation<
      'api::citsclient.citsclient',
      'manyToMany',
      'api::citspolicy.citspolicy'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citsclient.citsclient',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citsclient.citsclient',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitscoverageCitscoverage extends Schema.CollectionType {
  collectionName: 'citscoverages';
  info: {
    singularName: 'citscoverage';
    pluralName: 'citscoverages';
    displayName: 'Cits Coverage';
    description: 'Represents insurance coverages, detailing coverage numbers, status, amounts, and participant information.';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    pol_number: Attribute.String & Attribute.Required;
    plan_name: Attribute.String;
    product_code: Attribute.String;
    cov_number: Attribute.String & Attribute.Required;
    life_cov_status: Attribute.String;
    life_cov_type_code: Attribute.String;
    indicator_code: Attribute.String;
    lives_type: Attribute.String;
    expiry_date: Attribute.Date;
    current_amt: Attribute.Decimal;
    modal_prem_amt: Attribute.Decimal;
    annual_prem_amt: Attribute.Decimal;
    eff_date: Attribute.Date;
    tobacco_premium_basis: Attribute.String;
    issue_gender: Attribute.String;
    participants: Attribute.JSON;
    policyId: Attribute.Relation<
      'api::citscoverage.citscoverage',
      'manyToOne',
      'api::citspolicy.citspolicy'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citscoverage.citscoverage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citscoverage.citscoverage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitseappCitseapp extends Schema.CollectionType {
  collectionName: 'citseapps';
  info: {
    singularName: 'citseapp';
    pluralName: 'citseapps';
    displayName: 'Cits eApp';
    description: 'Captures details about electronic applications, including policy numbers, dates, and submission types.';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    pol_number: Attribute.String & Attribute.Required & Attribute.Unique;
    signed_date: Attribute.Date;
    submission_date: Attribute.Date;
    submission_type: Attribute.String;
    replacement_ind: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citseapp.citseapp',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citseapp.citseapp',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitspolicyCitspolicy extends Schema.CollectionType {
  collectionName: 'citspolicies';
  info: {
    singularName: 'citspolicy';
    pluralName: 'citspolicies';
    displayName: 'Cits Policy';
    description: 'Defines insurance policies with detailed attributes including policy numbers, types, amounts, and related client and agent information.';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    pol_number: Attribute.String & Attribute.Required & Attribute.Unique;
    line_of_business: Attribute.String;
    product_type: Attribute.String;
    product_code: Attribute.String;
    carrier_code: Attribute.String;
    plan_name: Attribute.String;
    policy_status: Attribute.String;
    jurisdiction: Attribute.String;
    eff_date: Attribute.Date;
    term_date: Attribute.Date;
    paid_to_date: Attribute.Date;
    payment_mode: Attribute.String;
    payment_amt: Attribute.Decimal;
    annual_payment_amt: Attribute.Decimal;
    primary_insured_client_id: Attribute.String;
    relations: Attribute.JSON;
    clientid: Attribute.String;
    agentid: Attribute.String;
    clientIds: Attribute.Relation<
      'api::citspolicy.citspolicy',
      'manyToMany',
      'api::citsclient.citsclient'
    >;
    agentIds: Attribute.Relation<
      'api::citspolicy.citspolicy',
      'manyToMany',
      'api::citsagent.citsagent'
    >;
    citsCoverageIds: Attribute.Relation<
      'api::citspolicy.citspolicy',
      'oneToMany',
      'api::citscoverage.citscoverage'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citspolicy.citspolicy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citspolicy.citspolicy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCitsrequirementCitsrequirement
  extends Schema.CollectionType {
  collectionName: 'citsrequirements';
  info: {
    singularName: 'citsrequirement';
    pluralName: 'citsrequirements';
    displayName: 'Cits Requirement';
    description: 'Represents specific requirements or conditions associated with policies, including their statuses, categories, and relevant dates.';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    polNumber: Attribute.String;
    reqCode: Attribute.String;
    hoRequirementRefID: Attribute.String;
    requirementDetails: Attribute.Text;
    reqStatus: Attribute.String;
    requestedDate: Attribute.Date;
    fulfilledDate: Attribute.Date;
    reqCategory: Attribute.String;
    appliesToPartyID: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::citsrequirement.citsrequirement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::citsrequirement.citsrequirement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiClientClient extends Schema.CollectionType {
  collectionName: 'clients';
  info: {
    singularName: 'client';
    pluralName: 'clients';
    displayName: 'client';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    lastName: Attribute.String & Attribute.Required;
    firstName: Attribute.String & Attribute.Required;
    netWorth: Attribute.Decimal;
    homePhone: Attribute.String;
    email: Attribute.Email;
    clientType: Attribute.Enumeration<
      ['individual', 'household', 'organization']
    > &
      Attribute.DefaultTo<'household'>;
    prefix: Attribute.String;
    company: Attribute.String;
    title: Attribute.String;
    houseHoldType: Attribute.String;
    houseHoldName: Attribute.String;
    backgroundInformation: Attribute.Text;
    tags: Attribute.String;
    maritialStatus: Attribute.String;
    citsClientId: Attribute.Relation<
      'api::client.client',
      'oneToOne',
      'api::citsclient.citsclient'
    >;
    commissionLogEntryId: Attribute.Relation<
      'api::client.client',
      'oneToOne',
      'api::commissionlogentry.commissionlogentry'
    >;
    middleName: Attribute.String;
    address: Attribute.Component<'information.address'>;
    profileId: Attribute.Relation<
      'api::client.client',
      'oneToOne',
      'api::profile.profile'
    >;
    dateOfBirth: Attribute.Date;
    oldClientId: Attribute.String;
    mobilePhone: Attribute.String;
    oldId: Attribute.String;
    smokingStatus: Attribute.Integer;
    deleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    mergedTo: Attribute.String;
    source: Attribute.Enumeration<['newcase', 'cits', 'commission']>;
    occupation: Attribute.String;
    activities: Attribute.Component<'information.activity', true>;
    notes: Attribute.Component<'information.note', true>;
    documents: Attribute.Component<'information.document', true>;
    gender: Attribute.Enumeration<['Male', 'Female']>;
    dateOfOnboarding: Attribute.Date;
    profileImage: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::client.client',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::client.client',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCommissiondistributionCommissiondistribution
  extends Schema.CollectionType {
  collectionName: 'commissiondistributions';
  info: {
    singularName: 'commissiondistribution';
    pluralName: 'commissiondistributions';
    displayName: 'commissiondistribution';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    generalSettings: Attribute.Component<'information.settings', true>;
    rankOverrides: Attribute.Component<'information.rank-override', true>;
    generationOverrides: Attribute.Component<'information.settings', true>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<false>;
    largeCaseSettings: Attribute.Component<'information.settings', true>;
    accelerator: Attribute.Component<'information.settings', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::commissiondistribution.commissiondistribution',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::commissiondistribution.commissiondistribution',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCommissionlogCommissionlog extends Schema.CollectionType {
  collectionName: 'commissionlogs';
  info: {
    singularName: 'commissionlog';
    pluralName: 'commissionlogs';
    displayName: 'commissionlog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    carrier: Attribute.String;
    carrierId: Attribute.Relation<
      'api::commissionlog.commissionlog',
      'oneToOne',
      'api::carrier.carrier'
    >;
    statementDate: Attribute.Date;
    statementAmount: Attribute.Decimal;
    bankDepositStatus: Attribute.Enumeration<
      ['Statement Only', 'Deposit Received']
    >;
    depositDate: Attribute.Date;
    payrollStatus: Attribute.Enumeration<
      ['Just In', 'Current Pay Run', 'Processed', 'Logged - Paid', 'Issue']
    > &
      Attribute.DefaultTo<'Just In'>;
    fieldPayDate: Attribute.Date;
    originalStatement: Attribute.Media;
    statementPeriodStartDate: Attribute.Date;
    statementPeriodEndDate: Attribute.Date;
    deposit: Attribute.Decimal;
    totalPostMarkupRevenue: Attribute.Decimal;
    commissionLogEntryIds: Attribute.Relation<
      'api::commissionlog.commissionlog',
      'oneToMany',
      'api::commissionlogentry.commissionlogentry'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::commissionlog.commissionlog',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::commissionlog.commissionlog',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCommissionlogentryCommissionlogentry
  extends Schema.CollectionType {
  collectionName: 'commissionlogentries';
  info: {
    singularName: 'commissionlogentry';
    pluralName: 'commissionlogentries';
    displayName: 'commissionlogentry';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    line: Attribute.Integer & Attribute.Required;
    carrier: Attribute.String & Attribute.Required;
    carrierId: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'api::carrier.carrier'
    >;
    writingAgent: Attribute.String & Attribute.Required;
    writingAgentId: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'api::profile.profile'
    >;
    writingAgentPercentage: Attribute.Decimal & Attribute.Required;
    splitAgent1: Attribute.String;
    splitAgent1Id: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'api::profile.profile'
    >;
    splitAgent1Percentage: Attribute.Decimal;
    splitAgent2: Attribute.String;
    splitAgent2Id: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'api::profile.profile'
    >;
    splitAgent2Percentage: Attribute.Decimal;
    splitAgent3: Attribute.String;
    splitAgent3Id: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'api::profile.profile'
    >;
    splitAgent3Percentage: Attribute.Decimal;
    clientName: Attribute.String & Attribute.Required;
    policyAccountFund: Attribute.String & Attribute.Required;
    transactionDate: Attribute.Date & Attribute.Required;
    productCategory: Attribute.Enumeration<
      ['FYC', 'Bonus', 'Insurance', 'Investments', 'Affiliates']
    >;
    productDetails: Attribute.String;
    bonus: Attribute.Boolean & Attribute.Required;
    bonusMarkup: Attribute.Decimal;
    receivedRevenue: Attribute.Decimal & Attribute.Required;
    postMarkupRevenue: Attribute.Decimal & Attribute.Required;
    commissionLogId: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'manyToOne',
      'api::commissionlog.commissionlog'
    >;
    newCaseId: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'manyToOne',
      'api::newcase.newcase'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::commissionlogentry.commissionlogentry',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCompanyCompany extends Schema.CollectionType {
  collectionName: 'companies';
  info: {
    singularName: 'company';
    pluralName: 'companies';
    displayName: 'company';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    internalAccount: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDocumentDocument extends Schema.CollectionType {
  collectionName: 'documents';
  info: {
    singularName: 'document';
    pluralName: 'documents';
    displayName: 'document';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    topic: Attribute.String;
    carrier: Attribute.Enumeration<['beneva']>;
    content: Attribute.RichText;
    documentcontent: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::document.document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::document.document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFrontpageFrontpage extends Schema.CollectionType {
  collectionName: 'frontpages';
  info: {
    singularName: 'frontpage';
    pluralName: 'frontpages';
    displayName: 'frontpage';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    active: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    announcement: Attribute.Component<'information.announcement', true>;
    event: Attribute.Component<'information.events', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::frontpage.frontpage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::frontpage.frontpage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFundcategorytypeFundcategorytype
  extends Schema.CollectionType {
  collectionName: 'fundcategorytypes';
  info: {
    singularName: 'fundcategorytype';
    pluralName: 'fundcategorytypes';
    displayName: 'fundcategorytype';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    carrierId: Attribute.Relation<
      'api::fundcategorytype.fundcategorytype',
      'manyToOne',
      'api::carrier.carrier'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::fundcategorytype.fundcategorytype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::fundcategorytype.fundcategorytype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiInvestmentfeetypeInvestmentfeetype
  extends Schema.CollectionType {
  collectionName: 'investmentfeetypes';
  info: {
    singularName: 'investmentfeetype';
    pluralName: 'investmentfeetypes';
    displayName: 'investmentfeetype';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    feePercentage: Attribute.Decimal;
    fundCategoryTypeId: Attribute.Relation<
      'api::investmentfeetype.investmentfeetype',
      'oneToOne',
      'api::fundcategorytype.fundcategorytype'
    >;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::investmentfeetype.investmentfeetype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::investmentfeetype.investmentfeetype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiInvitationInvitation extends Schema.CollectionType {
  collectionName: 'invitations';
  info: {
    singularName: 'invitation';
    pluralName: 'invitations';
    displayName: 'invitation';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    inviteName: Attribute.String;
    inviteEmail: Attribute.Email & Attribute.Unique;
    invitePhoneNo: Attribute.String;
    inviteLicenseStatus: Attribute.Enumeration<
      [
        'No license - studying for exam',
        'No license - recently pass exam',
        'License - transfer',
        'No intention to get license'
      ]
    >;
    dateSponsoredOrContracted: Attribute.Date;
    inviteCreditRating: Attribute.Enumeration<
      ['Above 650', 'Between 650 and 500', 'Below 500']
    >;
    inviteHomeProvince: Attribute.String;
    inviteDateOfBirth: Attribute.Date;
    inviteFirstName: Attribute.String;
    inviteLastName: Attribute.String;
    inviteHomeAddress: Attribute.String;
    inviteHomeCity: Attribute.String;
    inviteMailAddress: Attribute.String;
    inviteMailCity: Attribute.String;
    inviteMailProvince: Attribute.String;
    inviteMiddleName: Attribute.String;
    inviteProfileImage: Attribute.Media;
    status: Attribute.Enumeration<
      [
        'new',
        'waitForExamResult',
        'profileCompleted',
        'eoCompleted',
        'preScreeningCompleted',
        'completed'
      ]
    > &
      Attribute.DefaultTo<'new'>;
    step: Attribute.Integer & Attribute.DefaultTo<1>;
    inviteExamResults: Attribute.Media;
    inviteCurrentLicense: Attribute.Media;
    inviteStandards: Attribute.Boolean & Attribute.DefaultTo<false>;
    invitePreviousCompany: Attribute.String;
    inviteLicenseIntention: Attribute.Enumeration<
      ['Intent to have license', 'No intention to get license']
    >;
    inviteAdvisorYear: Attribute.Boolean;
    profileStatus: Attribute.Boolean & Attribute.DefaultTo<false>;
    preScreeningStatus: Attribute.Boolean & Attribute.DefaultTo<false>;
    eoStatus: Attribute.Boolean & Attribute.DefaultTo<false>;
    licenseStatus: Attribute.Enumeration<['active', 'terminated', 'nolicense']>;
    previousSponsor: Attribute.String;
    inviteNickName: Attribute.String;
    inviter: Attribute.Relation<
      'api::invitation.invitation',
      'manyToOne',
      'api::profile.profile'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::invitation.invitation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::invitation.invitation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLicensestatusLicensestatus extends Schema.CollectionType {
  collectionName: 'licensestatuses';
  info: {
    singularName: 'licensestatus';
    pluralName: 'licensestatuses';
    displayName: 'licensestatus';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::licensestatus.licensestatus',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::licensestatus.licensestatus',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMenuMenu extends Schema.CollectionType {
  collectionName: 'menus';
  info: {
    singularName: 'menu';
    pluralName: 'menus';
    displayName: 'menu';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    href: Attribute.String;
    icon: Attribute.String;
    roles: Attribute.Component<'information.roles', true>;
    children: Attribute.Relation<
      'api::menu.menu',
      'oneToMany',
      'api::menu.menu'
    >;
    parent: Attribute.Relation<'api::menu.menu', 'manyToOne', 'api::menu.menu'>;
    appRoles: Attribute.Component<'information.app-role', true>;
    order: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::menu.menu', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::menu.menu', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiMonthlyMetricMonthlyMetric extends Schema.CollectionType {
  collectionName: 'monthly_metrics';
  info: {
    singularName: 'monthly-metric';
    pluralName: 'monthly-metrics';
    displayName: 'monthlyMetric';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    profileId: Attribute.Relation<
      'api::monthly-metric.monthly-metric',
      'oneToOne',
      'api::profile.profile'
    >;
    yearMonth: Attribute.Integer & Attribute.Required;
    metricName: Attribute.String & Attribute.Required;
    metricValue: Attribute.Decimal & Attribute.Required;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::monthly-metric.monthly-metric',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::monthly-metric.monthly-metric',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNetworkNetwork extends Schema.CollectionType {
  collectionName: 'networks';
  info: {
    singularName: 'network';
    pluralName: 'networks';
    displayName: 'network';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    oldParentId: Attribute.String;
    oldChildId: Attribute.String;
    parentId: Attribute.Relation<
      'api::network.network',
      'manyToOne',
      'api::profile.profile'
    >;
    childId: Attribute.Relation<
      'api::network.network',
      'manyToOne',
      'api::profile.profile'
    >;
    commissionSplitFraction: Attribute.Decimal;
    deletedAt: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::network.network',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::network.network',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNewcaseNewcase extends Schema.CollectionType {
  collectionName: 'newcases';
  info: {
    singularName: 'newcase';
    pluralName: 'newcases';
    displayName: 'newcase';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    writingAgentId: Attribute.Relation<
      'api::newcase.newcase',
      'manyToOne',
      'api::profile.profile'
    >;
    splitAgents: Attribute.Component<'information.spliting-agent', true>;
    appInfo: Attribute.Component<'information.app-info'>;
    applicants: Attribute.Component<'information.applicant', true>;
    appInsProducts: Attribute.Component<'information.app-product', true>;
    appInvProducts: Attribute.Component<'information.app-inv-product', true>;
    compliance: Attribute.Component<'information.compliance'>;
    applicationDocuments: Attribute.Media;
    illustrationDocuments: Attribute.Media;
    caseType: Attribute.Enumeration<['Insurance', 'Investment', 'Affiliate']>;
    status: Attribute.Enumeration<
      [
        'Pending Review',
        'UW/Processing',
        'UW/Approved',
        'Pending Pay',
        'Paid Settled',
        'Not Proceeded With',
        'Declined/Postponed',
        'Lapse/Withdrawn',
        'Unknown'
      ]
    >;
    totalEstFieldRevenue: Attribute.Decimal;
    totalAnnualPremium: Attribute.Decimal;
    totalCoverageFaceAmount: Attribute.Decimal;
    appAffiliateProduct: Attribute.Component<
      'information.affiliate-product',
      true
    >;
    totalAnnualAUM: Attribute.Decimal;
    estSettledDays: Attribute.Integer;
    monthlyBillingPremium: Attribute.Decimal;
    settledDate: Attribute.Date;
    commissionLogEntriesIds: Attribute.Relation<
      'api::newcase.newcase',
      'oneToMany',
      'api::commissionlogentry.commissionlogentry'
    >;
    oldId: Attribute.String;
    clientId: Attribute.Relation<
      'api::newcase.newcase',
      'oneToOne',
      'api::client.client'
    >;
    stage: Attribute.Enumeration<
      [
        'Pending Review',
        'UW/Processing',
        'UW/Approved',
        'Pending Pay',
        'Paid Settled',
        'Not Proceeded With',
        'Declined/Postponed',
        'Lapse/Withdrawn',
        'Unknown'
      ]
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::newcase.newcase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::newcase.newcase',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNotificationNotification extends Schema.CollectionType {
  collectionName: 'notifications';
  info: {
    singularName: 'notification';
    pluralName: 'notifications';
    displayName: 'notification';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    title: Attribute.String;
    message: Attribute.Text;
    profileId: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'api::profile.profile'
    >;
    link: Attribute.String;
    isRead: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOpportunityOpportunity extends Schema.CollectionType {
  collectionName: 'opportunities';
  info: {
    singularName: 'opportunity';
    pluralName: 'opportunities';
    displayName: 'Opportunity';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    profileId: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'api::profile.profile'
    >;
    description: Attribute.String;
    type: Attribute.Enumeration<['Insurance', 'Investment', 'Affiliate']>;
    estAmount: Attribute.Decimal;
    status: Attribute.Enumeration<
      [
        'Prospect',
        'Discovery',
        'Planning',
        'Plan Ready',
        'Pending Close',
        'Paper Work',
        'In The Mill'
      ]
    >;
    clientId: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'api::client.client'
    >;
    items: Attribute.Component<'information.items', true>;
    intent: Attribute.Enumeration<['Good', 'Stuck', 'Lost']>;
    activities: Attribute.Component<'information.activity', true>;
    planningOptions: Attribute.Enumeration<
      ['Life Insurance Solutions', 'Retirement Planning', 'Kid Education']
    >;
    carrierId: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'api::carrier.carrier'
    >;
    productCategoryId: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'api::productcategory.productcategory'
    >;
    fundCategoryTypeId: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'api::fundcategorytype.fundcategorytype'
    >;
    notes: Attribute.Component<'information.note', true>;
    documents: Attribute.Component<'information.file', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::opportunity.opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPasswordresettokenPasswordresettoken
  extends Schema.CollectionType {
  collectionName: 'passwordresettokens';
  info: {
    singularName: 'passwordresettoken';
    pluralName: 'passwordresettokens';
    displayName: 'passwordresettoken';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    email: Attribute.Email;
    token: Attribute.String;
    expireAt: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::passwordresettoken.passwordresettoken',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::passwordresettoken.passwordresettoken',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPaymentperiodPaymentperiod extends Schema.CollectionType {
  collectionName: 'paymentperiods';
  info: {
    singularName: 'paymentperiod';
    pluralName: 'paymentperiods';
    displayName: 'paymentperiod';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    payPeriodDate: Attribute.Date;
    accountIds: Attribute.Relation<
      'api::paymentperiod.paymentperiod',
      'manyToMany',
      'api::account.account'
    >;
    advisorRevenue: Attribute.Component<'information.advisor-revenue', true>;
    totalSettledPayment: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::paymentperiod.paymentperiod',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::paymentperiod.paymentperiod',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPaymentperiodpreviewPaymentperiodpreview
  extends Schema.CollectionType {
  collectionName: 'paymentperiodpreviews';
  info: {
    singularName: 'paymentperiodpreview';
    pluralName: 'paymentperiodpreviews';
    displayName: 'paymentperiodpreview';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    payPeriodDate: Attribute.Date & Attribute.Unique;
    totalCommissionDeposited: Attribute.Decimal;
    totalPersonalAmount: Attribute.Decimal;
    totalPostMarkupRevenue: Attribute.Decimal;
    totalAgencyAmount: Attribute.Decimal;
    totalGenerationAmount: Attribute.Decimal;
    status: Attribute.Enumeration<['preview', 'settled']>;
    paymentPreviewIds: Attribute.Relation<
      'api::paymentperiodpreview.paymentperiodpreview',
      'oneToMany',
      'api::paymentpreview.paymentpreview'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::paymentperiodpreview.paymentperiodpreview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::paymentperiodpreview.paymentperiodpreview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPaymentpreviewPaymentpreview extends Schema.CollectionType {
  collectionName: 'paymentpreviews';
  info: {
    singularName: 'paymentpreview';
    pluralName: 'paymentpreviews';
    displayName: 'paymentpreview';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    totalPersonalAmount: Attribute.Decimal & Attribute.DefaultTo<0>;
    totalEscrow: Attribute.Decimal;
    netDeposit: Attribute.Decimal;
    totalAgencyAmount: Attribute.Decimal & Attribute.DefaultTo<0>;
    totalGenerationAmount: Attribute.Decimal & Attribute.DefaultTo<0>;
    statementLog: Attribute.Component<'information.statement-log', true>;
    status: Attribute.Enumeration<['preview', 'settled']>;
    totalEscrowAmount: Attribute.Decimal;
    totalFieldRevenue: Attribute.Decimal;
    payPeriodDate: Attribute.Date;
    paymentPeriodPreviewId: Attribute.Relation<
      'api::paymentpreview.paymentpreview',
      'manyToOne',
      'api::paymentperiodpreview.paymentperiodpreview'
    >;
    profileId: Attribute.Relation<
      'api::paymentpreview.paymentpreview',
      'manyToOne',
      'api::profile.profile'
    >;
    totalAmount: Attribute.Decimal;
    totalTeamFieldRevenue: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::paymentpreview.paymentpreview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::paymentpreview.paymentpreview',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    singularName: 'product';
    pluralName: 'products';
    displayName: 'product';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    carrierId: Attribute.Relation<
      'api::product.product',
      'manyToOne',
      'api::carrier.carrier'
    >;
    productcategoryId: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'api::productcategory.productcategory'
    >;
    userAdded: Attribute.Boolean;
    FYC: Attribute.Decimal;
    overrideCarrierBonus: Attribute.Decimal;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductcategoryProductcategory
  extends Schema.CollectionType {
  collectionName: 'productcategories';
  info: {
    singularName: 'productcategory';
    pluralName: 'productcategories';
    displayName: 'productcategory';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String;
    productCategoryGroup: Attribute.Enumeration<
      [
        'Insurance',
        'Investment',
        'Residual (Trails/Renewals)',
        'FYC',
        'Bonus',
        'Affiliates'
      ]
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::productcategory.productcategory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::productcategory.productcategory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductcodeProductcode extends Schema.CollectionType {
  collectionName: 'productcodes';
  info: {
    singularName: 'productcode';
    pluralName: 'productcodes';
    displayName: 'productcode';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String & Attribute.Required & Attribute.Unique;
    description: Attribute.String;
    productType: Attribute.Enumeration<
      [
        'Annuities',
        'Critical Illness',
        'Disability',
        'Final Protection Non-Par Whole life Issue',
        'Term Insurance',
        'Universal Life',
        'Whole Life'
      ]
    >;
    commission: Attribute.Decimal;
    promoted: Attribute.Enumeration<['New', 'Promoted']>;
    carrierId: Attribute.Relation<
      'api::productcode.productcode',
      'oneToOne',
      'api::carrier.carrier'
    >;
    active: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::productcode.productcode',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::productcode.productcode',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProfileProfile extends Schema.CollectionType {
  collectionName: 'profiles';
  info: {
    singularName: 'profile';
    pluralName: 'profiles';
    displayName: 'profile';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    owner: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    firstName: Attribute.String;
    lastName: Attribute.String;
    middleName: Attribute.String;
    nickName: Attribute.String;
    dateOfBirth: Attribute.Date;
    profileImage: Attribute.Media;
    invitations: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::invitation.invitation'
    >;
    mobilePhone: Attribute.String;
    homePhone: Attribute.String;
    officePhone: Attribute.String;
    referralCode: Attribute.String;
    rankId: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'api::rank.rank'
    >;
    recruitedById: Attribute.String;
    creditScore: Attribute.Integer;
    previousCompany: Attribute.String;
    advisorDuration: Attribute.Integer;
    status: Attribute.Enumeration<['new', 'completed']> &
      Attribute.DefaultTo<'new'>;
    settings: Attribute.JSON;
    step: Attribute.Integer;
    oldId: Attribute.String;
    oldProfileImageId: Attribute.String;
    oldBeneficiaryId: Attribute.String;
    externalAccount: Attribute.Component<'account.external-account', true>;
    homeAddress: Attribute.Component<'information.address'>;
    mailAddress: Attribute.Component<'information.address'>;
    bankingInformation: Attribute.Component<'information.banking-information'>;
    beneficiary: Attribute.Component<'information.beneficiary'>;
    subscriptionSetting: Attribute.Component<'information.subscription-settings'>;
    childIds: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::network.network'
    >;
    parentIds: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::network.network'
    >;
    administrative: Attribute.Component<'information.administrative'>;
    rankHistory: Attribute.Component<'information.rank-history', true>;
    openBalance: Attribute.Decimal & Attribute.DefaultTo<0>;
    appRoles: Attribute.Component<'information.app-role', true>;
    newcasesIds: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::newcase.newcase'
    >;
    advisorTargetIds: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::advisortarget.advisortarget'
    >;
    accountId: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'api::account.account'
    >;
    paymentPreviewIds: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::paymentpreview.paymentpreview'
    >;
    licenseContracting: Attribute.Component<'information.license-contracting'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProvinceProvince extends Schema.CollectionType {
  collectionName: 'provinces';
  info: {
    singularName: 'province';
    pluralName: 'provinces';
    displayName: 'province';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    shortName: Attribute.String;
    provinceCode: Attribute.String;
    countryId: Attribute.Integer & Attribute.DefaultTo<1>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::province.province',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::province.province',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRankRank extends Schema.CollectionType {
  collectionName: 'ranks';
  info: {
    singularName: 'rank';
    pluralName: 'ranks';
    displayName: 'rank';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    rankValue: Attribute.Integer;
    commissionCollectionMode: Attribute.Integer;
    rankCode: Attribute.String;
    fastTrackProductionRequirement: Attribute.Integer;
    totalLifeTimeProductionRequirement: Attribute.Integer;
    category: Attribute.Integer;
    agencyCommissionPercentage: Attribute.Decimal;
    oneYearProductionRequirement: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::rank.rank', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::rank.rank', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiRelationshipRelationship extends Schema.CollectionType {
  collectionName: 'relationships';
  info: {
    singularName: 'relationship';
    pluralName: 'relationships';
    displayName: 'relationship';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::relationship.relationship',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::relationship.relationship',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSettingSetting extends Schema.SingleType {
  collectionName: 'settings';
  info: {
    singularName: 'setting';
    pluralName: 'settings';
    displayName: 'setting';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    readyToPay: Attribute.Boolean;
    numberOfPayments: Attribute.Integer;
    progressOfPayments: Attribute.Integer;
    numberOfSettledPayments: Attribute.Integer;
    progressOfSettledPayments: Attribute.Integer;
    isSettling: Attribute.Boolean & Attribute.DefaultTo<false>;
    OKRMonthTargetSettings: Attribute.JSON;
    isGeneratingPayroll: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::setting.setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::setting.setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSubscriptionplanSubscriptionplan
  extends Schema.CollectionType {
  collectionName: 'subscriptionplans';
  info: {
    singularName: 'subscriptionplan';
    pluralName: 'subscriptionplans';
    displayName: 'subscriptionplan';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    stripePlanId: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::subscriptionplan.subscriptionplan',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::subscriptionplan.subscriptionplan',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    singularName: 'tag';
    pluralName: 'tags';
    displayName: 'tag';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    tagName: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTicketTicket extends Schema.CollectionType {
  collectionName: 'tickets';
  info: {
    singularName: 'ticket';
    pluralName: 'tickets';
    displayName: 'ticket';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    status: Attribute.Enumeration<['open', 'in_progress', 'closed']> &
      Attribute.DefaultTo<'open'>;
    priority: Attribute.Enumeration<['low', 'medium', 'high']> &
      Attribute.DefaultTo<'medium'>;
    assignedTo: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'api::profile.profile'
    >;
    reportedBy: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'api::profile.profile'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::comments.comment': PluginCommentsComment;
      'plugin::comments.comment-report': PluginCommentsCommentReport;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::account.account': ApiAccountAccount;
      'api::accounttransaction.accounttransaction': ApiAccounttransactionAccounttransaction;
      'api::advisortarget.advisortarget': ApiAdvisortargetAdvisortarget;
      'api::article.article': ApiArticleArticle;
      'api::carrier.carrier': ApiCarrierCarrier;
      'api::carriertraining.carriertraining': ApiCarriertrainingCarriertraining;
      'api::citsagent.citsagent': ApiCitsagentCitsagent;
      'api::citsclient.citsclient': ApiCitsclientCitsclient;
      'api::citscoverage.citscoverage': ApiCitscoverageCitscoverage;
      'api::citseapp.citseapp': ApiCitseappCitseapp;
      'api::citspolicy.citspolicy': ApiCitspolicyCitspolicy;
      'api::citsrequirement.citsrequirement': ApiCitsrequirementCitsrequirement;
      'api::client.client': ApiClientClient;
      'api::commissiondistribution.commissiondistribution': ApiCommissiondistributionCommissiondistribution;
      'api::commissionlog.commissionlog': ApiCommissionlogCommissionlog;
      'api::commissionlogentry.commissionlogentry': ApiCommissionlogentryCommissionlogentry;
      'api::company.company': ApiCompanyCompany;
      'api::document.document': ApiDocumentDocument;
      'api::frontpage.frontpage': ApiFrontpageFrontpage;
      'api::fundcategorytype.fundcategorytype': ApiFundcategorytypeFundcategorytype;
      'api::investmentfeetype.investmentfeetype': ApiInvestmentfeetypeInvestmentfeetype;
      'api::invitation.invitation': ApiInvitationInvitation;
      'api::licensestatus.licensestatus': ApiLicensestatusLicensestatus;
      'api::menu.menu': ApiMenuMenu;
      'api::monthly-metric.monthly-metric': ApiMonthlyMetricMonthlyMetric;
      'api::network.network': ApiNetworkNetwork;
      'api::newcase.newcase': ApiNewcaseNewcase;
      'api::notification.notification': ApiNotificationNotification;
      'api::opportunity.opportunity': ApiOpportunityOpportunity;
      'api::passwordresettoken.passwordresettoken': ApiPasswordresettokenPasswordresettoken;
      'api::paymentperiod.paymentperiod': ApiPaymentperiodPaymentperiod;
      'api::paymentperiodpreview.paymentperiodpreview': ApiPaymentperiodpreviewPaymentperiodpreview;
      'api::paymentpreview.paymentpreview': ApiPaymentpreviewPaymentpreview;
      'api::product.product': ApiProductProduct;
      'api::productcategory.productcategory': ApiProductcategoryProductcategory;
      'api::productcode.productcode': ApiProductcodeProductcode;
      'api::profile.profile': ApiProfileProfile;
      'api::province.province': ApiProvinceProvince;
      'api::rank.rank': ApiRankRank;
      'api::relationship.relationship': ApiRelationshipRelationship;
      'api::setting.setting': ApiSettingSetting;
      'api::subscriptionplan.subscriptionplan': ApiSubscriptionplanSubscriptionplan;
      'api::tag.tag': ApiTagTag;
      'api::ticket.ticket': ApiTicketTicket;
    }
  }
}
