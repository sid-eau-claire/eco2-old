'use client'
import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Tables/TableView';
import { fetchConfirmSettledCase } from '../_actions/newcase';
import {PageContainer, ColContainer, RowContainer} from '@/components/Containers';
import { ToolTip } from '@/components/Common/ToolTip';
import { BiDetail } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { PopupComponent } from '@/components/Popup';
import { LoadingButtonNP } from '@/components/Button';
import ChangeStatus from './ChangeStatus';  
import EditRecord from './EditRecord';
import { FaCommentDots } from "react-icons/fa";
import CommentsBox from '@/components/Comments';
import ViewCommissionLogEntries from './ViewCommissionLogEntries'; 
import { CiDatabase } from "react-icons/ci";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const ConfirmSettle = ({status, refreshTab, setRefreshTab}: {status: string, refreshTab: number, setRefreshTab: any}) => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [advisor, setAdvisor] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showCommissionLogEntries, setShowCommissionLogEntries] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [selectedRecordsData, setSelectedRecordsData] = useState<any[]>([]);
  const [isCommentsBoxVisible, setIsCommentsBoxVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchRecords = async () => {
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      const response = await fetchConfirmSettledCase(advisor, status, page, pageSize, search, formattedStartDate, formattedEndDate);
      setRecords(response.data || []);
      setPageCount(response.meta.pagination.pageCount || 0);
    };
    fetchRecords();
  }, [advisor, page, pageSize, search, startDate, endDate, refreshTab]);

  useEffect(() => {
    const filtered = records.filter(record => {
      return Object.values(record).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredRecords(filtered);
  }, [records, search]);

  const resetFilters = () => {
    setSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const selectColumn = {
    id: 'select',
    header: () => <></>,
    cell: (info: any) => {
      const [isChecked, setIsChecked] = useState(selectedRecords.includes(info.row.original.id));
  
      useEffect(() => {
        setIsChecked(selectedRecords.includes(info.row.original.id));
      }, [selectedRecords, info.row.original.id]);
  
      return (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            const recordId = info.row.original.id;
            setSelectedRecords(prevSelectedRecords => {
              const filteredRecords = prevSelectedRecords.filter(id => id !== recordId);
              return e.target.checked ? [...filteredRecords, recordId] : filteredRecords;
            });
          }}
        />
      );
    },
  };

  useEffect(() => {
    const tempSelectedRecordsData: any[] = [];
    selectedRecords.forEach((recordId) => {
      const record = records.find((record: any) => record.id === recordId);
      if (record) {
        tempSelectedRecordsData.push(record);
      }
    });
    setSelectedRecordsData(tempSelectedRecordsData); 
  }, [selectedRecords, records]);

  const columns = useMemo(() => [
    selectColumn, 
    {
      accessorFn: (row: any) => row.applicants.find((applicant: any) => applicant.isOwner === true)?.firstName + ' ' + row.applicants.find((applicant: any) => applicant.isOwner === true)?.lastName,
      header: 'Owner',
      cell: (info: any) => info.getValue(),
      id: 'owner_name'
    },
    {
      accessorFn: (row: any) => row.appInfo?.carrierId?.carrierName,
      header: 'Carrier',
      cell: (info: any) => info.getValue(),
      id: 'carrier_name'
    },
    {
      accessorFn: (row: any) => {
        const product = row.appInsProducts.length > 0 ? row.appInsProducts[0]?.productId?.name : row.appInvProducts[0]?.registrationType;
        return product ? product.substring(0, 20) : 'N/A';
      },
      header: 'Product Name',
      id: 'product_name'
    },
    {
      accessorFn: (row: any) => {
        const coverage = row?.totalCoverageFaceAmount || row?.totalAnnualAUM;
        return coverage ? coverage.toLocaleString() : 'N/A';
      },
      header: 'Coverage/AUM Amount',
      cell: (info: any) => `$${info.getValue()}`,
      id: 'coverage_amount'
    },
    {
      accessorFn: (row: any) => row?.totalEstFieldRevenue || row.appInvProducts[0]?.estFieldRevenue,
      header: 'Est. Revenue',
      cell: (info: any) => `$${info.getValue()}`,
      id: 'est_field_revenue'
    },
    {
      accessorFn: (row: any) => new Date(row.createdAt).toLocaleDateString(),
      header: 'Created Date',
      cell: (info: any) => info.getValue(),
      id: 'created_date'
    },
    {
      accessorFn: (row: any) => new Date(row.settledDate).toLocaleDateString(),
      header: 'Settled Date',
      cell: (info: any) => info.getValue(),
      id: 'settled_date'
    },    
    {
      accessorFn: (row: any) => `${row.writingAgentId.firstName} ${row.writingAgentId.lastName}`,
      header: 'Writing Agent',
      cell: (info: any) => info.getValue(),
      id: 'writing_agent'
    },
    {
      id: 'detail',
      header: () => <span className="font-semibold w-[1rem]"></span>,
      cell: (info: any) => (
        <div className="flex flex-row space-x-6">
          <ToolTip message='Logs' hintHPos='-6rem'>
            <button
              onClick={() => {setSelectedRecord(info.row.original); setShowCommissionLogEntries(true)}}
              className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.3rem] mr-[0.5rem] "
              >
              <CiDatabase className='cursor-pointer' size={24}/>
            </button>
          </ToolTip>             
          <ToolTip message='Remark' hintHPos='-6rem'>
            <button
              onClick={() => {setSelectedRecord(info.row.original); setIsCommentsBoxVisible(true)}}
              className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.3rem] mr-[0.5rem] "
              >
              <FaCommentDots className='cursor-pointer' size={24}/>
            </button>
          </ToolTip>          
          <ToolTip message='View case' hintHPos='-6rem'>
            <button
              onClick={() => {setSelectedRecord(info.row.original); setShowPopup(true)}}
              className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.3rem] mr-[0.5rem] "
              >
              <BiDetail className='cursor-pointer' size={24}/>
            </button>
          </ToolTip>
          <ToolTip message='Edit case' hintHPos='-6rem'>
            <button
              onClick={() => {setSelectedRecord(info.row.original); setShowEditPopup(true)}}
              className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.3rem] mr-[0.5rem] "
              >
              <MdEdit className='cursor-pointer' size={24}/>
            </button>
          </ToolTip>
        </div>
      ),
    },     
  ], []);

  return (
    <ColContainer cols="1:1:1:1">
      <RowContainer className='flex flex-row justify-end items-center py-2 space-x-4'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={resetFilters}
          variant="outline"
        >
          Reset
        </Button>
        <LoadingButtonNP
          loadingText='..'
          className='bg-primary text-white py-0 px-2 w-[6rem] my-0 rounded-sm'
          onClick={() => {setShowChangeStatus(true)}}
        >
          Status
        </LoadingButtonNP>        
      </RowContainer>
      <RowContainer>
        <GenericTable
          className='min-h-[calc(100vh-20rem)]'
          columns={columns}
          data={filteredRecords}
          search={search}
          pageIndex={page - 1}
          pageSize={pageSize}
          pageCount={pageCount}
          onPreviousPage={() => setPage(old => Math.max(old - 1, 1))}
          onNextPage={() => setPage(old => (old < pageCount ? old + 1 : old))}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          onRefresh={() => {}}
        />
      </RowContainer>
      {selectedRecord && showPopup && (
        <PopupComponent isVisible={selectedRecord} onClose={() => setSelectedRecord(null)}>
          {selectedRecord && <EditRecord selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} isEditable={true}/>}
        </PopupComponent>
      )}
      {showChangeStatus && (
        <PopupComponent isVisible={showChangeStatus} onClose={() => {setSelectedRecords([]); setShowChangeStatus(false)}}>
          <ChangeStatus selectedRecordsData={selectedRecordsData} close={()=>{setShowChangeStatus(false);setRefreshTab(refreshTab + 1)}}/>
        </PopupComponent>
      )}
      {selectedRecord && showEditPopup && (
        <PopupComponent isVisible={selectedRecord} onClose={() => setSelectedRecord(null)} className=''>
          <>
            {selectedRecord && <EditRecord selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} />}
          </>
        </PopupComponent>
      )}
      {isCommentsBoxVisible && selectedRecord?.id && (
        <CommentsBox
            collectionType="newcase"
            id={selectedRecord?.id || ''}
            isOpen={isCommentsBoxVisible}
            onClose={() => setIsCommentsBoxVisible(false)}
        />
      )}
      {showCommissionLogEntries && selectedRecord?.commissionLogEntriesIds &&(
        <PopupComponent isVisible={showCommissionLogEntries} onClose={() => setShowCommissionLogEntries(false)}>
          <ViewCommissionLogEntries entries={selectedRecord?.commissionLogEntriesIds} onClose={()=>{}}/>
        </PopupComponent>
      )}
    </ColContainer>
  );
}

export default ConfirmSettle;