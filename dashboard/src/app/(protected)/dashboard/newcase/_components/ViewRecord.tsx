import React from 'react'
import EditRecord from './EditRecord'
const ViewRecord = ({selectedRecord, setSelectedRecord}: {selectedRecord: any, setSelectedRecord: any}) => {
  return (
    <div className='relative'>
      <EditRecord selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord}/>
    </div>
  )
}

export default ViewRecord