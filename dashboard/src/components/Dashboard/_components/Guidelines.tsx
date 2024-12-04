'use client'
import React, { ReactNode, useRef } from "react";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/autoplay';
import Image from "next/image";
// import fetchArticles from "./FetchGuidelines";
// import Link from "next/link";

const CarouselOne: React.FC<{ guidelines: any[] }> = ({ guidelines }) => {
  const swiperRef = useRef(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  let articles = null;
  // articles = await fetchArticles();
  // try {
  //   // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/articles?populate[0]=photo&filters[menu][$eq]=guidelines&filters[showInDashboard][$eq]=true&sort[0]=seq:asc`,
  //   const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/articles?populate[0]=photo&filters[menu][$eq]=guidelines&sort[0]=seq:asc&fields[0]=menu&fields[1]=subMenu&fields[2]=topic&fields[3]=summary`,
  //     { headers: {
  //         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
  //         application: 'application/json'
  //       },
  //       next: {revalidate: 60, tags: ['guidelines']}
  //     }
  //   ); 
  //   articles = await response.json().then((data) => data.data);
  //   // articles = response?.data?.data;
  // } catch (error) {
  //   console.error('Error fetching article:', error);
  // }


  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
        <h3 className="font-medium text-black dark:text-white">
          Guidelines
        </h3>
      </div>

      <div className="p-2 sm:p-4 xl:p-6">
        <Swiper
          ref={swiperRef}
          className="carouselOne"
          navigation={true}
          modules={[Navigation, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          onInit={(swiper) => {
            //@ts-ignore
            swiper.params.navigation.prevEl = prevRef.current;
            //@ts-ignore
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
        >
          {guidelines && guidelines.map((article: { attributes: {
            subMenu: any;
            summary: any;
            topic: ReactNode; photo: { data: { attributes: { url: string; }; }; };}; }, key: React.Key | null | undefined) => (
              <SwiperSlide key={key}>
                <Image
                  width={1190}
                  height={450}
                  src={article.attributes.photo.data.attributes.url}
                  alt="carousel"
                  className="mb-2 rounded-md shadow-md relative"
                />
                <span className="text-lg semibold">{article.attributes.topic}</span>
                <span>{article.attributes.summary.split(' ').slice(0, 10).join(' ') + ' ...'}</span>
                <span className="absolute right-4 top-4 bg-black/80 text-white rounded-lg p-2">News!!</span>
              </SwiperSlide>
            //     <Link href={`/dashboard/guidelines/${article.attributes.subMenu}`} key={key}>
            // </Link>  
          ))}
          
          {/* <div className="swiper-button-prev w-[5px] h-[5px]  " ref={prevRef}>
            <svg
              className="fill-current"
              width="3"
              height="5"
              viewBox="0 0 12 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2344 19.4875C10.0094 19.4875 9.78438 19.4125 9.63437 19.225L1.15937 10.6C0.821875 10.2625 0.821875 9.73748 1.15937 9.39997L9.63437 0.774976C9.97188 0.437476 10.4969 0.437476 10.8344 0.774976C11.1719 1.11248 11.1719 1.63748 10.8344 1.97498L2.95937 9.99998L10.8719 18.025C11.2094 18.3625 11.2094 18.8875 10.8719 19.225C10.6469 19.375 10.4594 19.4875 10.2344 19.4875Z"
                fill=""
              />
            </svg>
          </div>
          <div className="swiper-button-next" ref={nextRef}>
            <svg
              className="fill-current"
              width="3"
              height="5"
              viewBox="0 0 12 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.75938 19.4875C1.53438 19.4875 1.34687 19.4125 1.15937 19.2625C0.821875 18.925 0.821875 18.4 1.15937 18.0625L9.03437 9.99998L1.15937 1.97498C0.821875 1.63748 0.821875 1.11248 1.15937 0.774976C1.49687 0.437476 2.02187 0.437476 2.35937 0.774976L10.8344 9.39997C11.1719 9.73748 11.1719 10.2625 10.8344 10.6L2.35937 19.225C2.20937 19.375 1.98438 19.4875 1.75938 19.4875Z"
                fill=""
              />
            </svg>
          </div> */}
        </Swiper>
      </div>
    </div>
  );
};

export default CarouselOne;
