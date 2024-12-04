import React from 'react'
import Advancement from './Advancement'
import KPISummary from './KPISummary'
import FieldRevenueSummary from './FieldRevenueSummary'
import OKRSummary from './OKRSummary'

const Overview = ({profileId}: {profileId: string}) => {

  return (
    <div className="space-y-4">
      <Advancement profileId={profileId}/>
      <KPISummary profileId={profileId} />

      {/* Settled Revenue by Month and OKR Summary */}
      <div className="flex flex-col lg:flex-row gap-6 p-[1.4rem]">
        <div className="w-full h-full lg:w-2/3">
          <FieldRevenueSummary profileId={profileId} />
        </div>
        <div className="lg:w-1/3 h-full">
          <OKRSummary advisor={Number(profileId)} />
        </div>
      </div>
    </div>
  );
};

export default Overview;