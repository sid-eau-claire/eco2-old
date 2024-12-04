import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Switch } from '@/components/Input';
import { LoadingButtonNP } from '@/components/Button';
import { PanelContainer } from '@/components/Containers';
import { fetchCommissionDistributions, createCommissionDistributions } from './../_actions/commissionDistribution';

// Define zod schema for validation
const schema = z.object({
  isActive: z.boolean(),
  generalSettings: z.array(z.object({
    id: z.number().optional(),
    description: z.string(),
    value: z.number(),
    level: z.number().nullable().optional(),
    name: z.string(),
  })),
  rankOverrides: z.array(z.object({
    id: z.number().optional(),
    override: z.number(),
    rankId: z.number()
  })),
  generationOverrides: z.array(z.object({
    id: z.number().optional(),
    description: z.string(),
    value: z.number(),
    level: z.number(),
    name: z.string(),
  })),
  largeCaseSettings: z.array(z.object({
    id: z.number().optional(),
    description: z.string(),
    value: z.number(),
    level: z.number().nullable().optional(),
    name: z.string(),
  })),
  accelerator: z.array(z.object({
    id: z.number().optional(),
    description: z.string(),
    value: z.number(),
    level: z.number().nullable().optional(),
    name: z.string(),
  }))
});

type CommissionDistributionFormValues = z.infer<typeof schema>;

const CommissionDistributionForm: React.FC = () => {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CommissionDistributionFormValues>({
    resolver: zodResolver(schema)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rankOptions, setRankOptions] = useState<{ id: number; name: string }[]>([]);

  // Field arrays for dynamic form sections
  const settingsFields = {
    generalSettings: useFieldArray({
      control,
      name: 'generalSettings'
    }),
    rankOverrides: useFieldArray({
      control,
      name: 'rankOverrides'
    }),
    generationOverrides: useFieldArray({
      control,
      name: 'generationOverrides'
    }),
    largeCaseSettings: useFieldArray({
      control,
      name: 'largeCaseSettings'
    }),
    accelerator: useFieldArray({
      control,
      name: 'accelerator'
    }),
  };

  // Default values for each type of field
  const defaultValues: any = {
    generalSettings: {
      id: undefined,
      description: '',
      value: 0,
      level: null,
      name: ''
    },
    rankOverrides: {
      id: undefined,
      override: 0,
      rankId: 0
    },
    generationOverrides: {
      id: undefined,
      description: '',
      value: 0,
      level: 0,
      name: ''
    },
    largeCaseSettings: {
      id: undefined,
      description: '',
      value: 0,
      level: null,
      name: ''
    },
    accelerator: {
      id: undefined,
      description: '',
      value: 0,
      level: null,
      name: ''
    }
  };

  // Fetch initial data and populate form
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCommissionDistributions();
        const rankOverrides = data[0].rankOverrides.map((override: any) => ({
          ...override,
          rankId: override.rankId.id // Convert nested object to a simple id
        }));
        setRankOptions(data[0].rankOverrides.map((override: any) => override.rankId));
        reset({ ...data[0], rankOverrides });
        console.log('data', data[0])
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit: SubmitHandler<CommissionDistributionFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        rankOverrides: data.rankOverrides.map((override) => ({
          ...override,
          rankId: rankOptions.find(r => r.id === override.rankId)?.id || 0
        }))
      };
      const response = await createCommissionDistributions(2, payload); // Adjust ID as needed
      console.log('Update result:', response);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating commission distribution:', error);
      setIsSubmitting(false);
    }
  };

  // Helper to render sections with dynamic fields
  const renderFieldArrays = (arrayName: keyof typeof settingsFields) => {
    return settingsFields[arrayName].fields.map((field, index) => (
      <div key={field.id} className="grid grid-cols-3 gap-4">
        <div className='flex flex-row justify-start items-center space-x-8'>
          {arrayName === 'rankOverrides' ? (
            <>
              <select {...register(`${arrayName}.${index}.rankId` as const)} className="w-[32rem]">
                {rankOptions.map((rank) => (
                  <option key={rank.id} value={rank.id}>
                    {rank.name}
                  </option>
                ))}
              </select>
              <Input type="number" label="Override" register={register} name={`${arrayName}.${index}.override`} className="w-[8rem]" step={0.01} />
            </>
          ) : (
            <>
              <Input label="Description" register={register} name={`${arrayName}.${index}.description`} className='w-[25rem]' />
              <Input type="number" label="Value" register={register} name={`${arrayName}.${index}.value`} className="w-[8rem]" step={0.01} />
            </>
          )}
        </div>
      </div>
    ));
  };

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <PanelContainer header="Commission Distribution">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <Switch
          label="Active"
          name="isActive"
          register={register}
          isChecked={true}
          onChange={() => {}}
          isEditable={true}
        />
        {Object.keys(settingsFields).map((key) => (
          <div key={key}>
            <h3 className="font-bold">{capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1').trim())}</h3>
            {renderFieldArrays(key as keyof typeof settingsFields)}
            {/* <button type="button" onClick={() => settingsFields[key as keyof typeof settingsFields].append(defaultValues[key as keyof typeof settingsFields])} className='bg-success text-white px-4 py-2 rounded-sm shadow-md'>
              Add New
            </button> */}
          </div>
        ))}
        <input type="submit" value="Submit" className="bg-primary text-white p-2 rounded-md mt-4" />
      </form>
    </PanelContainer>
  );
};

export default CommissionDistributionForm;
