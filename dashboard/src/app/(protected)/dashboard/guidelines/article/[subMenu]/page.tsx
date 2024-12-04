import React from 'react'
import Article from '@/components/ReactParser/Article'
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

type ArticleType = {
  data: {
    attributes: {
      menu: string,
      subMenu: string,
      topic: string,
      content: any,
      photo: {data: {attributes: {url: string}}} | null
    }
  }[]
};

const page = async ({ params }: { params: { subMenu: string } }) => {
  let article = null;
  try {
    const response = await axios.get<ArticleType>(`${process.env.STRAPI_BACKEND_URL}/api/articles?filters[subMenu][$eq]=${params.subMenu}&filters[menu][$eq]=guidelines&populate[0]=photo`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
    }
    );
    article = response?.data;
  } catch (error) {
    console.error('Error fetching article:', error);
  }
  console.log(article)
  // console.log(article?.data[0]?.attributes?.content)
  return (
    <>
      <Breadcrumb pageName={article?.data[0]?.attributes?.topic ?? ''} parent={{ name: 'Guidelines' , href:  '/dashboard/guidelines' }} />
      {article &&  
      //  (<>test</>)
        <Article article={article?.data[0]?.attributes}/>
      }
    </>
  )
}

export default page