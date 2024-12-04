'use client'
import React, { useState } from 'react';
import { cn } from "@/utils/cn";
import { Card, ProgressBar, BarChart, DonutChart } from '@tremor/react';
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import {Celebration} from '@/components/Common'


import { SessionProvider } from "next-auth/react";
// import {Calendar} from "@/components/Google";

import {GoogleCalendar} from '@/components/Calendar';


export default function Example() {
  const chartdata = [
    {
      name: 'Amphibians',
      'Number of threatened species': 2488,
    },
    {
      name: 'Birds',
      'Number of threatened species': 1445,
    },
    {
      name: 'Crustaceans',
      'Number of threatened species': 743,
    },
    {
      name: 'Ferns',
      'Number of threatened species': 281,
    },
    {
      name: 'Arachnids',
      'Number of threatened species': 251,
    },
    {
      name: 'Corals',
      'Number of threatened species': 232,
    },
    {
      name: 'Algae',
      'Number of threatened species': 98,
    },
  ];
  const datahero = [
    {
      name: 'Noche Holding AG',
      value: 9800,
    },
    {
      name: 'Rain Drop AG',
      value: 4567,
    },
    {
      name: 'Push Rail AG',
      value: 3908,
    },
    {
      name: 'Flow Steal AG',
      value: 2400,
    },
    {
      name: 'Tiny Loop Inc.',
      value: 2174,
    },
    {
      name: 'Anton Resorts Holding',
      value: 1398,
    },
  ];
  const chartdata1 = [
    {
      name: 'Topic 1',
      'Group A': 890,
      'Group B': 338,
      'Group C': 538,
      'Group D': 396,
      'Group E': 138,
      'Group F': 436,
    },
    {
      name: 'Topic 2',
      'Group A': 289,
      'Group B': 233,
      'Group C': 253,
      'Group D': 333,
      'Group E': 133,
      'Group F': 533,
    },
    {
      name: 'Topic 3',
      'Group A': 380,
      'Group B': 535,
      'Group C': 352,
      'Group D': 718,
      'Group E': 539,
      'Group F': 234,
    },
    {
      name: 'Topic 4',
      'Group A': 90,
      'Group B': 98,
      'Group C': 28,
      'Group D': 33,
      'Group E': 61,
      'Group F': 53,
    },
  ]
  
  const dataFormatter = (number: number) =>
    Intl.NumberFormat('us').format(number).toString();
  
  return (
    // <SessionProvider>
      <div className='flex flex-col space-y-4'>
        <Navbar className="top-[10rem]" />
        <Card className="mx-auto max-w-md">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Sales
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            $71,465
          </p>
          <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>32% of annual target</span>
            <span>$225,000</span>
          </p>
          <ProgressBar value={32} className="mt-2" />
        </Card>
        <BarChart
          data={chartdata}
          index="name"
          categories={['Number of threatened species']}
          colors={['blue']}
          valueFormatter={dataFormatter}
          yAxisWidth={48}
          onValueChange={(v) => console.log(v)}
        />
        <div>
          <div className="mx-auto space-y-12">
            <div className="space-y-3">
              <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                donut variant 1
              </span>
              <div className="flex justify-center">
                <DonutChart
                  data={datahero}
                  variant="donut"
                  valueFormatter={dataFormatter}
                  onValueChange={(v) => console.log(v)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                pie variant
              </span>
              <div className="flex justify-center">
                <DonutChart
                  data={datahero}
                  variant="pie"
                  valueFormatter={dataFormatter}
                  onValueChange={(v) => console.log(v)}
                />
              </div>
            </div>
            <div>
            <BarChart
              className="mt-6"
              data={chartdata1}
              index="name"
              categories={[
                'Group A',
                'Group B',
                'Group C',
                'Group D',
                'Group E',
                'Group F',
              ]}
              colors={['blue', 'teal', 'amber', 'rose', 'indigo', 'emerald']}
              valueFormatter={dataFormatter}
              yAxisWidth={48}
            />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center ">
          <h1 className="text-4xl font-bold mb-8">Google Calendar Integration</h1>
          <GoogleCalendar />
        </div>        
      </div>
    // </SessionProvider>
  );
}
 
function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Products">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Algochurn"
              href="https://algochurn.com"
              src="/images/icon/icon-sun.svg"
              description="Prepare for tech interviews like never before."
            />
            <ProductItem
              title="Tailwind Master Kit"
              href="https://tailwindmasterkit.com"
              src="/images/icon-sun.svg"
              description="Production ready Tailwind css components for your next project"
            />
            <ProductItem
              title="Moonbeam"
              href="https://gomoonbeam.com"
              src="/images/icon-sun.svg"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <ProductItem
              title="Rogue"
              href="https://userogue.com"
              src="/images/icon-sun.svg"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
      <Celebration />
      {/* <div className="flex flex-col items-center justify-center ">
        <h1 className="text-4xl font-bold mb-8">Google Calendar Integration</h1>
        <Calendar />
      </div> */}
    </div>
  );
}