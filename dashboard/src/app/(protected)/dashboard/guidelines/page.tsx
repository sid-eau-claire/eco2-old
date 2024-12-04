import React from 'react'
import Article from '@/components/ReactParser/Article'
import axios from 'axios';
import {menuItems} from '@/components/MenuItems';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import CardsItem from '@/components/Cards/CardsItem';
import { strapiFetch } from '@/lib/strapi';


type ArticleType = {
  data: {
    attributes: {
      menu: string,
      subMenu: string,
      topic: string,
      content: string,
      photo: {data: {attributes: {url: string}}} | null
      summary: string,
      href: string
    }
  }[]
};

const page = async () => {
  let articles = null;
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/articles?populate[0]=photo&filters[menu][$eq]=guidelines&sort[0]=seq:asc&fields[0]=menu&fields[1]=subMenu&fields[2]=topic&fields[3]=summary`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
      next: {revalidate: 60, tags: ['guidelines']}
    }
    );
    articles = await response.json().then((data) => data.data);
    console.log(articles)
  } catch (error) {
    console.error('Error fetching article:', error);
  }
  return (
    <>
      <Breadcrumb pageName="Guidelines" />
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
        {articles && 
          articles.map((article: { attributes: {
            subMenu: any; summary: any; content1: string | undefined; topic: string | undefined; content: string | undefined; photo: { data: { attributes: { url: undefined; }; }; }; 
}; }, index: number | undefined) => (
            <CardsItem
              key={index?.toString()}
              index={index}
              cardTitle={article?.attributes?.topic}
              cardSummary={article?.attributes?.summary}
              cardContent={article?.attributes?.content1}
              href={`/dashboard/guidelines/article/${article?.attributes?.subMenu}`}
              cardImageSrc={article?.attributes?.photo?.data?.attributes?.url == undefined ? '' : article?.attributes?.photo?.data?.attributes?.url}
            />
          ))
        }
      </div>
    </>
  )
}

export default page