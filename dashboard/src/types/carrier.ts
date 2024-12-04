export type DocumentType = {
  id: string;
  title: string;
  htmlLink: string;
  productType: string;
  documentType: string;
  category: string; // Ensure this is spelled correctly as "category" not "categroy"
};

export type TrainingType = {
  id: string;
  link: string;
  topic: string;  
  productType: any;
};

export type ContractingType = {
  proofs: any[];
  questions: any[]; 
};

export type CarrierType = {
  id: string,
  carrierName: string,
  menu: string,
  subMenu: string,
  topic: string,
  content: string,
  photo: any,
  summary: string,
  href: string
  life: boolean,
  criticialIllness: boolean,
  disability: boolean,
  focus: boolean,
  bgColor: string,
  textColor: string
  products: string[],
  documents: DocumentType[],
  training: TrainingType[]
  contact: string
  contracting: ContractingType,
  carrierVideoId1: string,
  carrierVideoId2: string,
  carrierVideoId3: string,
};