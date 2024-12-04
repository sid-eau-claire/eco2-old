'use client';
import React, { useState, useEffect, useMemo } from 'react';
import TableViewCache from '@/components/Tables/TableViewCache'; // Adjust the path as needed
import { PageContainer, ColContainer, RowContainer } from '@/components/Containers';
import { useRouter } from 'next/navigation';
import { ProfileIcon } from '@/components/Icons';

const ListProfiles = ({ profiles }: { profiles: any }) => {
  const router = useRouter();
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [showAdditionalColumns, setShowAdditionalColumns] = useState(false);

  useEffect(() => {
    const filterProfiles = (profiles: any, searchTerm: string) => {
      return profiles.filter((profile: any) => {
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    };
    setFilteredProfiles(filterProfiles(profiles, search));
  }, [profiles, search]);

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.length === 10) {
      return `+1 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    }
    return phoneNumber;
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: 'detail',
        header: () => <span className="font-semibold w-[1rem]"></span>,
        cell: (info: any) => (
          <ProfileIcon profileId={info.row.original.id} className='w-[1.5rem] h-[1.5rem]' />
        ),
      },
      {
        accessorFn: (row: any) => row.firstName + ' ' + row.lastName,
        header: 'Name',
        id: 'name',
      },
      {
        accessorFn: (row: any) => row.rankId?.name,
        header: 'Rank',
        id: 'rank',
        sortingFn: (a: any, b: any) => {
          const rankA = a.original.rankId?.rankValue || 0;
          const rankB = b.original.rankId?.rankValue || 0;
          return rankB - rankA; // Descending order
        },
      },
      // {
      //   accessorFn: (row: any) => formatPhoneNumber(row.mobilePhone),
      //   header: 'Mobile Phone',
      //   id: 'mobile_phone',
      // },
      {
        accessorFn: (row: any) => row.subscriptionSetting?.planId?.name,
        header: 'Subscription Plan',
        id: 'subscription_plan',
      },
      {
        accessorFn: (row: any) => row.licenseContracting?.contracted ? 'Yes' : 'No',
        header: 'Contracted',
        id: 'contracted',
      },
      {
        accessorFn: (row: any) => row.licenseContracting?.dateContracted || row.licenseContracting?.contractTerminateAt,
        header: 'Contracted/Terminated Date',
        id: 'contracted_terminated_date',
        cell: (info: any) => {
          const dateContracted = info.row.original.licenseContracting?.dateContracted;
          const dateTerminated = info.row.original.licenseContracting?.contractTerminateAt;
          return dateContracted ? new Date(dateContracted).toLocaleDateString() : dateTerminated ? new Date(dateTerminated).toLocaleDateString() : 'N/A';
        }
      }
    ];

    if (showAdditionalColumns) {
      baseColumns.push(
        {
          accessorFn: (row: any) => formatPhoneNumber(row.mobilePhone),
          header: 'Mobile Phone',
          id: 'mobile_phone',
        },
      );
    }

    return baseColumns;
  }, [showAdditionalColumns]);

  return (
    <PageContainer pageName="All Profile in system">
      <ColContainer cols="1:1:1:1">
        <RowContainer className='flex flex-row justify-end items-center p-2'>
          <label className="m-2">Show Additional Columns</label>
          <input
            type="checkbox"
            checked={showAdditionalColumns}
            onChange={() => setShowAdditionalColumns(!showAdditionalColumns)}
            className="border p-1 mr-4"
          />
          <input
            type="text"
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-1"
          />
        </RowContainer>
        {/* <RowContainer className='flex flex-row justify-end items-center p-2'>
        </RowContainer> */}
        <RowContainer>
          <TableViewCache
            data={filteredProfiles}
            columns={columns}
            pageSize={pageSize}
            initialSorting={[]}
          />
        </RowContainer>
      </ColContainer>
    </PageContainer>
  );
};

export default ListProfiles;
