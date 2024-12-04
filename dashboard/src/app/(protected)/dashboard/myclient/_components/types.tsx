export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  title: string;
  company: string;
  prefix: string;
  dateOfBirth: string;
  mobilePhone: string;
  homePhone: string;
  address: {
    address: string
    city: string
    provinceId: string
    countryId: string
  };
  tags: any;  
  clientType: string;
  houseHoldType: string;
  houseHoldName: string;
  backgroundInformation: string;
  maritialStatus: string;
  smokingStatus: string;
  netWorth: number | null;
  activities?: any[];
  notes?: any[];
  documents?: any[];
}

export type ListRecordProps = {
  clients: Client[]
  onSelectPerson: (personId: string) => void
  profileId: string
}


export type ClientListProps = {
  clients: Client[]
  setSelectedPerson: (personId: string) => void
  setRefresh: (refresh: number) => void
  profileId: string
}

export type Province = {
  id: string
  name: string
}

export type PersonProps = {
  personId: string
  onClose: () => void
  profileId: string
}

export type Address = {
  address: string
  city: string
  provinceId: string
  postalCode: string
  countryId: string
}