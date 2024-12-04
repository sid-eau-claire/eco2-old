import { twMerge  } from "tailwind-merge";
const Loader = ({className}: {className?: string}) => {
  return (
    <div className={twMerge(`flex h-screen items-center justify-center bg-white`, className)}>
      {/* <div className="h-16 w-16 animate-spin rounded-full border-6 border-solid border-logo border-t-transparent"></div> */}
      <img src="/images/eauclaire/logo.svg" className="h-16 w-16 animate-spin"></img>
    </div>
  );
};

export default Loader;
