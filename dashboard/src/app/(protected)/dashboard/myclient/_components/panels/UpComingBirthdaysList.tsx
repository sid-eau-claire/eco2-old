import React from 'react';
import { format, addYears, differenceInDays, differenceInYears } from 'date-fns';
import { Cake, Gift } from 'lucide-react';

type UpComingBirthdaysListProps = {
  clients: any[];
}

const UpComingBirthdaysList: React.FC<UpComingBirthdaysListProps> = ({ clients }) => {
  const today = new Date();
  const oneMonthFromNow = addYears(today, 1);
  const clientsWithUpcomingBirthdays = clients
    .filter(client => {
      if (!client.dateOfBirth) return false;
      const birthDate = new Date(client.dateOfBirth);
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      return nextBirthday <= oneMonthFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateOfBirth);
      const dateB = new Date(b.dateOfBirth);
      const nextBirthdayA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
      const nextBirthdayB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
      if (nextBirthdayA < today) nextBirthdayA.setFullYear(nextBirthdayA.getFullYear() + 1);
      if (nextBirthdayB < today) nextBirthdayB.setFullYear(nextBirthdayB.getFullYear() + 1);
      return nextBirthdayA.getTime() - nextBirthdayB.getTime();
    });

  const getComingInDays = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = differenceInDays(nextBirthday, today);
    return daysUntilBirthday === 0 ? "Today" : `${daysUntilBirthday} day${daysUntilBirthday > 1 ? 's' : ''} from now`;
  };

  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const age = differenceInYears(today, birthDate);
    return age;
  };

  return (
    <div className="rounded-lg shadow-md h-full max-h-[30rem] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center p-4">
        <Cake className="mr-2 text-pink-500" />
        Upcoming Birthdays
      </h2>
      <div className="overflow-y-auto flex-grow">
        {clientsWithUpcomingBirthdays.length === 0 ? (
          <p className="p-4">No upcoming birthdays in the next month.</p>
        ) : (
          <ul className="space-y-4 p-4">
            {clientsWithUpcomingBirthdays.map((client, index) => (
              <li key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{`${client.firstName} ${client.lastName}`}</h3>
                    <p className="text-gray-600">{client.email}</p>
                    <div className='flex justify-start items-center mt-2'>
                      <span className="text-sm text-gray-500">
                        Birthday: {format(new Date(client.dateOfBirth), 'MMMM d')}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({getAge(client.dateOfBirth)} years old)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{getComingInDays(client.dateOfBirth)}</p>
                    <Gift className="inline-block ml-2 text-yellow-500" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpComingBirthdaysList;