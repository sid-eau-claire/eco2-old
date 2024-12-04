'use client'
import { useEffect, useState } from 'react';
import { FaUser, FaTasks, FaStickyNote, FaCommentDollar,FaBackspace } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import  Link  from "next/link";
import { useRouter, usePathname  } from 'next/navigation';
const ClientPage = ({record, tags, editContact}: { record: any, tags: any, editContact: any }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [openTab, setOpenTab] = useState(1);
  const activeClasses = "text-primary border-primary";
  const inactiveClasses = "border-transparent";
  const { picture, fullName, clientFirstName, clientLastName, houseHoldType, houseHoldName, title, company, homePhone, email } = record;
  // console.log(record)

  return (
    <>
      <Link className="cursor-pointer" href={pathname.split('/').slice(0, -1).join('/')}>
        <span className='flex flex-row justify-start items-center'><p>All Contacts</p></span>
      </Link>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className='md: col-span-2'>
          <div className="w-full p-4 rounded-sm border border-stroke border-l-primary border-l-[0.2rem] bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div className="flex flex-row items-center">
                { record.picture ? <img src={picture} alt ="Client Picture" className="w-12 h-12 rounded-full" /> 
                  : 
                  <FaUser className="w-16 h-16 p-4 text-grey rounded-md bg-bodydark1" /> 
                }
                <div className="ml-4">
                  <h2 className="text-2xl mb-2 font-semibold text-black dark:text-white">{clientFirstName}&nbsp;{clientLastName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{title}&nbsp;at&nbsp;{company}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{houseHoldType}&nbsp;at&nbsp;{houseHoldName}</p>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{homePhone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
              </div>
          </div>
        </div>
        {/* <div className="w-full p-4 mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <p>panel 2</p>
        </div> */}
        <div className="rounded-sm border mt-4 border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6 flex flex-wrap gap-5 border-b border-stroke dark:border-strokedark sm:gap-10">
            <Link
              href="#"
              className={`item-center border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                openTab === 1 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(1)}
            >
              <div className='flex flex-row items-center space-x-4'><FaStickyNote/>Note</div>
            </Link>
            <Link
              href="#"
              className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                openTab === 2 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(2)}
            >
              <div className='flex flex-row items-center space-x-4'><FaTasks/>Task</div>
            </Link>
            <Link
              href="#"
              className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                openTab === 3 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(3)}
            >
              <div className='flex flex-row items-center space-x-4'><MdEventNote/>Event</div>
            </Link>
            <Link
              href="#"
              className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                openTab === 4 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(4)}
            >
              <div className='flex flex-row items-center space-x-4'><FaCommentDollar/>Opportunity</div>
            </Link>
          </div>

          <div>
            <div
              className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              luctus ligula nec dolor placerat, a consequat elit volutpat. Quisque
              nibh lacus, posuere et turpis in, pretium facilisis nisl. Proin congue
              sem vel sollicitudin sagittis. Class aptent taciti sociosqu ad litora
              torquent per conubia nostra, per
              <input className='w-full rounded-sm border border-stroke bg-white py-1 mt-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary'/>
            </div>
            <div
              className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
            >
              Tab2 ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              luctus ligula nec dolor placerat, a consequat elit volutpat. Quisque
              nibh lacus, posuere et turpis in, pretium facilisis nisl. Proin congue
              sem vel sollicitudin sagittis. Class aptent taciti sociosqu ad litora
              torquent per conubia nostra, per
              <input className='w-full rounded-sm border border-stroke bg-white py-1 mt-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary'/>
            </div>
            <div
              className={`leading-relaxed ${openTab === 3 ? "block" : "hidden"}`}
            >
              Tab3 ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              luctus ligula nec dolor placerat, a consequat elit volutpat. Quisque
              nibh lacus, posuere et turpis in, pretium facilisis nisl. Proin congue
              sem vel sollicitudin sagittis. Class aptent taciti sociosqu ad litora
              torquent per conubia nostra, per
              <input className='w-full rounded-sm border border-stroke bg-white py-1 mt-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary'/>
            </div>
            <div
              className={`leading-relaxed ${openTab === 4 ? "block" : "hidden"}`}
            >
              Tab4 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia
              nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas
              sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto
              quod.
              <input className='w-full rounded-sm border border-stroke bg-white py-1 mt-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary'/>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="w-full p-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3>Upcoming Activity</h3>
        </div>
        <div
          draggable="true"
          className="task relative flex cursor-move justify-between rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div>
            <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
              Task title
            </h5>

            <div className="flex flex-col gap-2">
              <label htmlFor="taskCheckbox1" className="cursor-pointer">
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    id="taskCheckbox1"
                    className="taskCheckbox sr-only"
                  />
                  <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark dark:bg-boxdark-2">
                    <span className="text-white opacity-0">
                      <svg
                        className="fill-current"
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.70685 0.292804C9.89455 0.480344 10 0.734667 10 0.999847C10 1.26503 9.89455 1.51935 9.70685 1.70689L4.70059 6.7072C4.51283 6.89468 4.2582 7 3.9927 7C3.72721 7 3.47258 6.89468 3.28482 6.7072L0.281063 3.70701C0.0986771 3.5184 -0.00224342 3.26578 3.785e-05 3.00357C0.00231912 2.74136 0.10762 2.49053 0.29326 2.30511C0.4789 2.11969 0.730026 2.01451 0.992551 2.01224C1.25508 2.00996 1.50799 2.11076 1.69683 2.29293L3.9927 4.58607L8.29108 0.292804C8.47884 0.105322 8.73347 0 8.99896 0C9.26446 0 9.51908 0.105322 9.70685 0.292804Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                  <p>Here is task one</p>
                </div>
              </label>

              <label htmlFor="taskCheckbox2" className="cursor-pointer">
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    id="taskCheckbox2"
                    className="taskCheckbox sr-only"
                    defaultChecked
                  />
                  <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark dark:bg-boxdark-2">
                    <span className="text-white opacity-0">
                      <svg
                        className="fill-current"
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.70685 0.292804C9.89455 0.480344 10 0.734667 10 0.999847C10 1.26503 9.89455 1.51935 9.70685 1.70689L4.70059 6.7072C4.51283 6.89468 4.2582 7 3.9927 7C3.72721 7 3.47258 6.89468 3.28482 6.7072L0.281063 3.70701C0.0986771 3.5184 -0.00224342 3.26578 3.785e-05 3.00357C0.00231912 2.74136 0.10762 2.49053 0.29326 2.30511C0.4789 2.11969 0.730026 2.01451 0.992551 2.01224C1.25508 2.00996 1.50799 2.11076 1.69683 2.29293L3.9927 4.58607L8.29108 0.292804C8.47884 0.105322 8.73347 0 8.99896 0C9.26446 0 9.51908 0.105322 9.70685 0.292804Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                  <p>Here is task Two</p>
                </div>
              </label>

              <label htmlFor="taskCheckbox3" className="cursor-pointer">
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    id="taskCheckbox3"
                    className="taskCheckbox sr-only"
                  />
                  <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark dark:bg-boxdark-2">
                    <span className="text-white opacity-0">
                      <svg
                        className="fill-current"
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.70685 0.292804C9.89455 0.480344 10 0.734667 10 0.999847C10 1.26503 9.89455 1.51935 9.70685 1.70689L4.70059 6.7072C4.51283 6.89468 4.2582 7 3.9927 7C3.72721 7 3.47258 6.89468 3.28482 6.7072L0.281063 3.70701C0.0986771 3.5184 -0.00224342 3.26578 3.785e-05 3.00357C0.00231912 2.74136 0.10762 2.49053 0.29326 2.30511C0.4789 2.11969 0.730026 2.01451 0.992551 2.01224C1.25508 2.00996 1.50799 2.11076 1.69683 2.29293L3.9927 4.58607L8.29108 0.292804C8.47884 0.105322 8.73347 0 8.99896 0C9.26446 0 9.51908 0.105322 9.70685 0.292804Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                  <p>Here is task Three</p>
                </div>
              </label>
            </div>
          </div>

          <div className="absolute right-4 top-4">
            {/* <DropdownDefault /> */}
          </div>
        </div>

        <div className="w-full p-4 mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

        </div>
      </div>

    </div>
  </>
  );
}

  

export default ClientPage;

