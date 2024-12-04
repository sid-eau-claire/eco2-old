'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { motion } from "framer-motion";

type BreadcrumbProps = {
  pageName: string;
  parent?: {
    name: string;
    href: string;
  };
}
const Breadcrumb = ({ pageName, parent }: BreadcrumbProps) => {
  const router = useRouter();
  return (
    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-title-md font-semibold ml-1 text-black dark:text-white">
          {pageName}
        </h2>
      </div>
      <nav>
        <motion.div className="hidden sm:flex items-center hover:text-primary hover:scale-105 cursor-pointer  "
          onClick={() => router.back()}
        >
          <IoMdArrowRoundBack className="inline-block text-2xl text-black dark:text-white" size={32}/>
          <p className="ml-1 text-lg text-black dark:text-white"
            // onClick={() => router.back()}
          > Back
          </p>
        </motion.div>
        {/* <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium cursor-pointer" href="/">
              Dashboard /
            </Link>
            {parent && (
              <Link className="font-medium cursor-pointer" href={parent.href}>
                 {` ${parent.name}`} /
              </Link>
            )}
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol> */}
      </nav>
    </div>
  );
};

export default Breadcrumb;
