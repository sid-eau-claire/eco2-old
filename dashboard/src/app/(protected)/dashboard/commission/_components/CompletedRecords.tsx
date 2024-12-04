import React, {useState, useEffect, use} from 'react'
import { PanelContainer } from '@/components/Containers'
import ListPaymentPeriod from './ListPaymentPeriod'
import ListCommission from './ListCommission'
import ListCommissionLogEntry from './ListCommissionLogEntry'
import DateRangePopup from '@/components/Input/DateRangePopup';
import { FaRegCalendarAlt } from "react-icons/fa";
import { ToolTip } from '@/components/Common/ToolTip';
import { BiReset } from "react-icons/bi";
import { getCarriers, getAdvisorNameList } from '../_actions/retrievedata';

const CompletedRecords = ({refreshTab, setRefreshTab}: {refreshTab: number, setRefreshTab: any}) => {
  const [selectedCommmissionLog, setSelectedCommmissionLog] = useState('');
  const [selectedPolicyAccountNumber, setSelectedPolicyAccountNumber] = useState('');
  const [isDateRangePopupVisible, setIsDateRangePopupVisible] = useState(false);
  const [searchPolicyAccountNumber, setSearchPolicyAccountNumber] = useState('');
  const [carrierList, setCarrierList] = useState<any[]>([]);
  const [advisorList, setAdvisorList] = useState<any[]>([]);
  const [sharedFilters, setSharedFilters] = useState({
    selectedCommmissionLog: '',
    selectedPolicyAccountNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    selectedCarrier: '',
    searchPolicyAccountNumber: '',
  });
  useEffect(() => {
    const prepareCarrierAndAdvisorList = async () => {
      const response = await getCarriers();
      setCarrierList(response || []);
      const response2  = await getAdvisorNameList();
      setAdvisorList(response2 || []);
    };
    prepareCarrierAndAdvisorList();
  }, []);  
  const reset = () => {
    setSharedFilters({
      selectedCommmissionLog: '',
      selectedPolicyAccountNumber: '',
      startDate: null,
      endDate: null,
      selectedCarrier: '',
      searchPolicyAccountNumber: '',
    });
  };  
  const handleDateRangeApply = (start: Date | null, end: Date | null) => {
    setSharedFilters({
      ...sharedFilters,
      startDate: start,
      endDate: end,
    });
    setIsDateRangePopupVisible(false);
  };
  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSharedFilters({
      ...sharedFilters,
      selectedCarrier: e.target.value,
    });
  }
  const handleConfirmSearch = (search: string) => {
    setSharedFilters({
      ...sharedFilters,
      searchPolicyAccountNumber: searchPolicyAccountNumber,
    });
  }
  // console.log('advisorList', advisorList)
  // console.log('searchPolicyAccountNumber:', searchPolicyAccountNumber)
  // console.log('end')
  return (
    <>
      <div className='flex flex-row justify-end items-center'>
        <ToolTip message='Calender Filter' hintHPos='-3rem' hintVPos="2.5rem">
          <button
            className="ml-4 pr-2 bg-transparent text-black  dark:text-white rounded hover:scale-110 transition duration-150 ease-in-out"
            onClick={() => setIsDateRangePopupVisible(true)}
            >
            <FaRegCalendarAlt size={30} />
          </button>
        </ToolTip>
        <ToolTip message='Filter by carrier'>
          <select
            name="carrier"
            value={sharedFilters.selectedCarrier}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCarrierChange(e)}
            className="w-[7rem] ml-4 border border-black rounded py-1 px-3 text-grey-darker shadow appearance-none"
          >
            <option value="">All carriers</option>
            {carrierList.map(carrier => (
              <option key={carrier.id} value={carrier.id}>{carrier.carrierName}</option>
            ))}
          </select>
        </ToolTip>
        <ToolTip message="Search Policy/Account Number. Press Enter to start search" hintHPos="-5rem" hintVPos="2.5rem">
          <input
            type="text"
            value={searchPolicyAccountNumber}
            onChange={(e) => setSearchPolicyAccountNumber(e.target.value)}
            placeholder="Search Policy/Account Number..."
            className="ml-4 shadow appearance-none border border-black rounded py-1 px-3 text-grey-darker"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log('Enter key pressed! Initiating search...');
                handleConfirmSearch(searchPolicyAccountNumber);
              }
            }}              
          />
        </ToolTip>
        <ToolTip message='Reset Filter' hintHPos='-3rem' hintVPos="2.5rem">
          <button
            className="ml-2 pr-2 bg-transparent text-black  dark:text-white rounded hover:scale-110 transition duration-150 ease-in-out"
            onClick={() => reset()}
            >
            <BiReset size={30} />
          </button>
        </ToolTip>          
      </div>
      <PanelContainer header ='Historical Pay Period Records' className='mt-4'>
        <ListPaymentPeriod refreshTab={refreshTab} setRefreshTab={setRefreshTab} sharedFilters={sharedFilters} setSharedFilters={setSharedFilters} />
      </PanelContainer>
      <PanelContainer header="Historical Commission Logs">
        <ListCommission initialPayrollStatus="Processed" refreshTab={refreshTab} setRefreshTab={setRefreshTab} sharedFilters={sharedFilters} setSharedFilters={setSharedFilters}/>
      </PanelContainer>
      <PanelContainer header="Historical Commission Log Entries">
        <ListCommissionLogEntry initialPayrollStatus="Processed" refreshTab={refreshTab} setRefreshTab={setRefreshTab} sharedFilters={sharedFilters} setSharedFilters={setSharedFilters}/>
      </PanelContainer>
      {isDateRangePopupVisible && (
        <DateRangePopup
          isOpen={isDateRangePopupVisible}
          onClose={() => setIsDateRangePopupVisible(false)}
          onApply={handleDateRangeApply}
          inputStartDate={sharedFilters.startDate}
          inputEndDate={sharedFilters.endDate}
        />
      )}  
    </>
  )
}

export default CompletedRecords