'use client'
import React, { useState, useEffect, useMemo } from 'react';
import TableViewCache from '@/components/Tables/TableViewCache';
import { PageContainer, ColContainer, RowContainer } from '@/components/Containers';
import { fetchNewCase } from './../_actions/newcase';
import { RoundButton } from '@/components/Button';
import { MdAddCircle } from "react-icons/md";
import { PopupComponent } from '@/components/Popup';
import { ToolTip } from '@/components/Common/ToolTip';
import { BiDetail } from "react-icons/bi";
import { CellContext } from '@tanstack/react-table'
import AddRecord from './AddRecord';
// import EditRecord from '../../../newcase/_components/EditRecord';
import EditRecord from './EditRecord';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { FaCommentDots } from "react-icons/fa";
import CommentsBox from '@/components/Comments';


type Record = {
  [key: string]: string | number | Record | null | undefined;
}

const statusColors: { [key: string]: string } = {
  'Pending Review': '#f1c40f',
  'UW/Processing': '#f39c12',
  'UW/Approved': '#2ecc71',
  'Pending Pay': '#27ae60',
  'Paid Settled': '#16a085',
  'Not Proceeded With': '#e74c3c',
  'Declined/Postponed': '#c0392b',
  'Lapse/Withdrawn': '#c0392b'
}

const isColorDark = (hexColor: string): boolean => {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}

const StatusCell = ({ getValue }: CellContext<any, any>) => {
  const status = getValue() as string
  const backgroundColor =  statusColors[status] || 'transparent'
  const textColor = isColorDark(backgroundColor) ? 'white' : 'black'
  return (
    <div style={{
      backgroundColor,
      color: textColor,
      padding: '0.4rem',
      borderRadius: '4px',
    }}>
      {status}
    </div>
  )
}

const StatusCell2 = ({ getValue }: CellContext<any, any>) => {
  const status = getValue() as string
  const bgColorClass = 'bg-' + statusColors[status] + ']'|| 'bg-transparent'
  const textColorClass = isColorDark(bgColorClass.slice(4, -1)) ? 'text-white' : 'text-black'
  
  return (
    <div className={twMerge(`p-1.5 rounded `, bgColorClass, textColorClass)}>
      {status}
    </div>
  )
}


const ListRecord = ({ advisor, session, cases }: { advisor: string, session: any, cases?: Number[] }) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isCommentsBoxVisible, setIsCommentsBoxVisible] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      const response = await fetchNewCase(Number(advisor), '', '');
      setRecords(response.data || []);
    };
    fetchRecords();
  }, [advisor, showAddRecord]);

  useEffect(() => {
    const filterRecords = (records: Record[], searchTerm: string): Record[] => {
      const searchNested = (obj: Record, term: string): boolean => {
        for (const key in obj) {
          if (obj[key] && typeof obj[key] === 'object') {
            if (searchNested(obj[key] as Record, term)) {
              return true;
            }
          } else if (obj[key] && String(obj[key]).toLowerCase().includes(term.toLowerCase())) {
            return true;
          }
        }
        return false;
      };
      return records.filter(record => searchNested(record, searchTerm));
    };
    const filtered = filterRecords(records, search);
    if (cases && cases.length > 0) {
      const filteredWithCases = filtered.filter((record: any) => cases.includes(record.id));
      setFilteredRecords(filteredWithCases);
    } else {
      setFilteredRecords(filtered);
    }
  }, [records, search, cases]);
  
  const columns = useMemo(() => [
    {
      id: 'detail',
      header: () => <span className="font-semibold w-[1rem]"></span>,
      cell: (info: any) => (
        <ToolTip message='View Detail' hintHPos='2.2rem'>
          <button
            onClick={() => {setSelectedRecord(info.row.original); setShowPopup(true)}}
            className="hover:scale-110 transition duration-150 ease-in-out w-[0.5rem]"
          >
            <BiDetail className='cursor-pointer' size={30}/>
          </button>
        </ToolTip>
      ),
    },     
    {
      accessorFn: (row: any) => row.applicants.find((applicant: any) => applicant.isOwner === true)?.firstName + ' ' + row.applicants.find((applicant: any) => applicant.isOwner === true)?.lastName,
      header: 'Client Name',
      id: 'owner_name'
    },
    {
      accessorFn: (row: any) => row.appInfo?.carrierId?.carrierName,
      header: 'Carrier',
      id: 'carrier_name'
    },
    {
      accessorFn: (row: any) => {
        const product = row.appInsProducts.length > 0 ? row.appInsProducts[0]?.productId?.name : row.appInvProducts[0]?.registrationType;
        return product ? product.substring(0, 20) : 'N/A';
      },
      header: 'Product Name',
      id: 'product_name',
      cell: ({ row }: {row: any}) => {
        const product = row.original.appInsProducts.length > 0 ? row.original.appInsProducts[0]?.productId?.name : row.original.appInvProducts[0]?.registrationType;
        const displayProduct = product ? product.substring(0, 20) : 'N/A';
        return (
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <span className='cursor-pointer'>{displayProduct}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{product || 'N/A'}</p>
              </TooltipContent>
            </Tooltip>

          </TooltipProvider>
        );
      },
    },
    {
      accessorFn: (row: any) => {
        const coverage = row?.totalCoverageFaceAmount || row?.totalAnnualAUM;
        return coverage ? coverage.toLocaleString() : 'N/A';
      },
      header: 'Coverage/AUM',
      cell: (info: any) => `$${info.getValue()}`,
      id: 'coverage_amount'
    },
    {
      accessorFn: (row: any) => row?.totalEstFieldRevenue || row.appInvProducts[0]?.estFieldRevenue,
      header: 'Est. Field Rev',
      cell: (info: any) => `$${info.getValue()}`,
      id: 'est_field_revenue'
    },
    {
      accessorFn: (row: any) => new Date(row.createdAt).toISOString(),
      header: 'Created Date',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
      id: 'created_date'
    },
    {
      accessorFn: (row: any) => `${row.writingAgentId.firstName} ${row.writingAgentId.lastName}`,
      header: 'Writing Agent',
      id: 'writing_agent'
    },
    {
      accessorFn: (row: any) => `${row.status}`,
      header: 'Status',
      id: 'Status',
      cell: StatusCell
    },
    {
      id: 'Action',
      cell: (info: any) => (
      <>
        <RoundButton
          icon={FaCommentDots}
          hint='Leave a comments'
          className='text-primary m-0'
          iconSize={24}
          hintHPos='-6rem'
          hintVPos='2rem'
          onClick={() => {setSelectedRecord(info.row.original); setIsCommentsBoxVisible(true)}}
          // onClick={() => handleMemoClick(info.row.original.id)} // Assuming each row has a unique 'id'
          // onClick={() => {setSelectedCommissionLogId(info.row.original.id); setIsCommentsBoxVisible(true)}} // Assuming each row has a unique 'id'
        />       
      </>)
    }


  ], []);
  console.log('records', records)
  return (
    <PageContainer pageName="Business Cases">
      {showAddRecord ? (
        <AddRecord setShowAddRecord={setShowAddRecord} advisor={advisor}/>
      ) : (
        <ColContainer cols="1:1:1:1">
          <RowContainer className='flex flex-row justify-between items-center p-2'>
            <RoundButton
              icon={MdAddCircle}
              className="bg-transparent text-primary rounded-md" 
              onClick={() => setShowAddRecord(true)}
              hint="Add a new business case"
            />  
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-1"
            />
          </RowContainer>
          <RowContainer>
            <TableViewCache
              data={filteredRecords}
              columns={columns}
              pageSize={10}
              initialSorting={[{ id: 'created_date', desc: true }]}
            />
          </RowContainer> 
        </ColContainer>
      )}
      {selectedRecord && showPopup && (
        <PopupComponent isVisible={true} onClose={() => {setShowPopup(false)}}>
          {selectedRecord && <EditRecord selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} isEditable={false} columnMode={false} />}
        </PopupComponent>
      )}
      {isCommentsBoxVisible && selectedRecord && (
        <CommentsBox
            collectionType="newcase"
            id={selectedRecord?.id}
            isOpen={isCommentsBoxVisible}
            onClose={() => setIsCommentsBoxVisible(false)}
            link={`/dashboard/mybusiness/newcase/${advisor}/${selectedRecord.id}`}
            recipientIds={[1]}
        />
      )}      
    </PageContainer>
  )
}

export default ListRecord;