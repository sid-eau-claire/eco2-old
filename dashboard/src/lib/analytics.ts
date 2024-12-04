import { event } from "nextjs-google-analytics";

export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}) => {
  event(action, {
    category,
    label,
    value,
  });
};


// How to use it
// import { trackEvent } from "../lib/analytics"; // Adjust the path as necessary

// const handleButtonClick = () => {
//   trackEvent({
//     action: "click",
//     category: "button",
//     label: "subscribe_button",
//     value: 1,
//   });
// };

// // In your component
// <button onClick={handleButtonClick}>Subscribe</button>
