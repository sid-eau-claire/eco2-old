import { FaCheckCircle, FaTimesCircle,FaExclamationCircle , FaQuestionCircle } from 'react-icons/fa';
import {ToolTip} from '@/components/Common/ToolTip';  
// const renderStatusIcon = (condition: boolean, isEqualCheck = false, tooltipMessage: string) => {
//   const size = 22;
//   return (
//     <ToolTip message={tooltipMessage}>
//       {condition ? (
//         <FaCheckCircle className="text-success" size={size || 22}/>
//       ) : isEqualCheck ? (
//         <FaQuestionCircle className="text-warning" size={size || 22} />
//       ) : (
//         <FaTimesCircle className="text-meta-4    " size={size || 22} />
//       )}
//     </ToolTip>
//   );
// };

const renderStatusIcon = (iconNumber: number, tooltipMessage: string) => {
  const size = 22;
  return (
    <ToolTip message={tooltipMessage}>
      {iconNumber === 1 ? (
        <FaCheckCircle className="text-success" size={size || 22}/>
      ) : iconNumber === 2 ? (
        <FaExclamationCircle  className="text-warning" size={size || 22} />
      ) : (
        <FaTimesCircle className="text-meta-4    " size={size || 22} />
      )}
    </ToolTip>
  );
};
export default renderStatusIcon;
