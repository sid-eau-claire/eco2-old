  const fullQuery = `
    query GetProfile($id: ID!) {
      profile(id: $id) {
        data {
          id
          attributes {
            createdAt
            updatedAt
            referralCode
            status
            creditScore
            advisorDuration
            rank
            firstName
            lastName
            middleName
            nickName
            dateOfBirth
            settings
            step
            previousCompany
            mobilePhone
            homePhone
            officePhone
            fundCode
            emailNotificationsEnabled
            homePostal
            mailPostal
            recruitedById
            receiveAdminNotifications
            payPeriodPayoutThreshold
            deactivatedAt
            rootSplitFraction
            commissionOverrideFraction
            isContracted
            contractedAt
            licenseStatusId
            organizationUnit
            contractTerminatedAt
            oldId
            oldProfileImageId
            oldBeneficiaryId
            owner {
              data {
                id
                attributes {
                  username
                  email
                  provider
                  confirmed
                  blocked
                  createdAt
                  updatedAt
                }
              }
            }
            homeAddressId {
              data {
                id
                attributes {
                  address
                  city
                  postalCode
                  countryId
                  createdAt
                  updatedAt
                  publishedAt
                }
              }
            }
            mailAddressId {
              data {
                id
                attributes {
                  address
                  city
                  postalCode
                  countryId
                  createdAt
                  updatedAt
                  publishedAt
                }
              }
            }
            bankingInformationId {
              data {
                id
                attributes {
                  createdAt
                  updatedAt
                  publishedAt
                  institutionNumber
                  transitNumber
                  accountNumber
                  oldDirectDepositFormFileId
                }
              }
            }
            rankId {
              data {
                id
                attributes {
                  name
                  rankValue
                  rankCode
                  fastTrackProductionRequirement
                  totalLifeTimeProductionRequirement
                  category
                  commissionCollectionMode
                  createdAt
                  updatedAt
                  publishedAt
                }
              }
            }
            beneficiaryId {
              data {
                id
                attributes {
                  firstName
                  lastName
                  homePhone
                  mobilePhone
                  createdAt
                  updatedAt
                  publishedAt
                  oldId
                }
              }
            }
            subscriptionSettingId {
              data {
                id
                attributes {
                  stripeCustomerId
                  cardBrand
                  cardLastFour
                  stripeSubscriptionPlanId
                  createdAt
                  updatedAt
                  publishedAt
                }
              }
            }
          }
        }
      }
    }
  `;

