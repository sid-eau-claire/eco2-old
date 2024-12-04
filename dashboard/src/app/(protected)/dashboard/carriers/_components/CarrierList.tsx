'use client'
import React from 'react'
import CarrierItem from './CarrierItem';
import {CarrierType} from '@/types/carrier';
import { PageContainer, ColContainer } from '@/components/Containers';

const page = async ({carriers}: {carriers: CarrierType[]}) => {
  return (
    <PageContainer pageName='Carriers'>
      <ColContainer cols='4:4:2:1'>
        {carriers &&
          carriers.filter(carrier => carrier.focus === true) // Filter carriers where focus is true
            .map((carrier, index) => (
                <CarrierItem
                  key={index.toString()}
                  index={index}
                  carrier={carrier}
                />
            ))
        }
      </ColContainer>
      <ColContainer cols='6:5:4:1' className='mt-4'>
        {carriers &&
          carriers.filter(carrier => carrier.focus === false) // Filter carriers where focus is true
            .map((carrier, index) => (
              <CarrierItem
                key={index.toString()}
                index={index}
                carrier={carrier}
              />
            ))
        }
      </ColContainer>
    </PageContainer>
  )
}

export default page