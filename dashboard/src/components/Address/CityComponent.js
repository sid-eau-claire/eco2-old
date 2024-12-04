import { City } from 'country-state-city';
import Dropdown from './Commons/Dropdown'

const CityComponent = ({ countryCode = 'CA', cityCode = 'TG' }) => {
    const data = City.getCitiesOfState(countryCode, cityCode).map(city => ({
        value: city.name,
        displayValue: city.name
    }))
    return <Dropdown options={data}></Dropdown>
}

export default CityComponent;