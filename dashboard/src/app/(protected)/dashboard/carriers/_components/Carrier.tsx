// components/Article.tsx
'use client'
import React from 'react'
import Image from 'next/image';
import {motion} from "framer-motion";
import styles from '@/app/styles/Article.module.css';
import parse, {domToReact} from 'html-react-parser';

type ArticleType = {
  menu: string;
  subMenu: string;
  topic: string;
  content: any;
  photo: any;
};

export default function Article({article}: {article: ArticleType}) {
      
  if (!article) {
    return <div>Loading...</div>;
  }
  const options = {
    replace: (domNode: any) => {
      if (domNode.type === 'tag' && domNode.attribs && domNode.attribs.class) {
        const cls = domNode.attribs.class;
        domNode.attribs.class = cls.split(" ").map((c: string | number) => styles[c]).join(" ");
      } 
    },
  };
  console.log(article)
  return (
    <motion.div className="container mx-auto"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.45 }}
    >

      <div  className={styles["ck-content"]}>
        { parse(article.content, options)}
      </div>
      
 
    </motion.div>
  );
}
