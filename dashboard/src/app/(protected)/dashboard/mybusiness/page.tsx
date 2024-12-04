import { Metadata } from "next";
import KPIContainer from "./../_components/KPIContainer"; 
// export const metadata: Metadata = {
//   title: "Eau Claire One | Dashboard",
//   description: "Dashboard for Eau Claire One",
//   // other metadata
// };

export default function Home() {
  return (
    <>
      <KPIContainer />
    </>
  );
}
