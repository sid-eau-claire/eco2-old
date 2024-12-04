'use client'
import React from 'react'
import {motion} from "framer-motion";
import styles from '@/app/styles/Article.module.css';
import parse, {domToReact} from 'html-react-parser';


export default function Panel({content}: {content: string}) {
      
  if (!content) {
    return <div>Loading...</div>;
  }
  const options = {
    replace: (domNode: any) => {
      if (domNode.type === 'tag' && domNode.attribs && domNode.attribs.class) {
        const cls = domNode.attribs.class;
        domNode.attribs.class = cls.split(" ").map((c: string | number) => styles[c]).join(" ");
        // domNode.attribs.className = ' bg-white text-black dark:bg-whiten dark:text-white'
        // console.log(domNode.attribs.class)
      } 
    },
  };
  // console.log(content)
  return (
    <motion.div className="container mx-auto"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{delay: 1, duration: 1, type: 'spring', bounce: 0.45 }}
    >
      <div  className={styles["ck-content"] + ' '}>
        { parse(content, options)}
      </div>
    </motion.div>
  );
}
