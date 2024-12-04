export const excelDateToJSDate = (excelDate: number) => {
  // Adjust for Excel's leap year bug in 1900
  // Excel falsely treats 1900 as a leap year
  if (excelDate > 60) {
    excelDate -= 1;
  }
  // Excel date serial number start date
  const EXCEL_EPOCH = new Date(1899, 11, 31);
  // Adding the excel date (days) to the epoch
  const jsDate = new Date(EXCEL_EPOCH.getTime() + excelDate * 86400000);
  // Convert to noon (12:00:00) in MST (UTC-7)
  // First, set to noon in UTC by considering the current timezone offset
  jsDate.setUTCHours(12 + 7, 0, 0, 0); // Adjust for MST being UTC-7

  return jsDate;
};