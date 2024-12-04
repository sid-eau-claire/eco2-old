// import { UseFormReturn } from 'react-hook-form';

// import { UseFormSetValue } from 'react-hook-form';

import { FieldValues, UseFormSetValue, UseFormReturn } from 'react-hook-form';

interface FormProps {
  mode: string;
  isEditable: boolean;
  setIsEditable: (editable: boolean) => void;
  form: UseFormReturn<any, any>; // You may specify stricter types based on usage
  formData: any; // Generalize the formData type or keep specific if preferred
  // setFormData: (data: any) => void;
  setFormData: UseFormSetValue<FieldValues>
  formComponents: { [key: string]: React.ComponentType<any> }; // Component types can be more specific
}

const Form: React.FC<FormProps> = ({
  mode,
  isEditable,
  setIsEditable,
  form,
  formData,
  setFormData,
  formComponents,
}) => {
  const { handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async () => {
    console.log('Submitted with data:', formData);
    // Add form submission logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {mode === 'edit' && (
        <button type='button' onClick={() => setIsEditable(!isEditable)}>
          {isEditable ? 'Save' : 'Edit'}
        </button>
      )}

      {Object.entries(formComponents).map(([key, Component]) => (
        <Component key={key} formData={formData} setFormData={setFormData} isEditable={isEditable} form={form} />
      ))}

      {isSubmitting && <div>Loading...</div>}
      {errors && Object.keys(errors).length > 0 && (
        <div>
          <p>Please correct the following errors:</p>
          <ul>
            {/* {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{`${key}: ${error.message || 'Error'}`}</li>
            ))} */}
          </ul>
        </div>
      )}
    </form>
  );
};

export default Form;
