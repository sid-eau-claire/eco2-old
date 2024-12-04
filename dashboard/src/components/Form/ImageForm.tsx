"use client";
import React from "react";
// import { useFormState } from "react-dom";
import { twMerge } from "tailwind-merge";

// import { uploadProfileImageAction } from "@/data/actions/profile-actions";

import LoadingButton from "@/components/Button/LoadingButton";
import ImagePicker from "@/components/Input/ImagePicker";
// import { ZodErrors } from "@/components/custom/ZodErrors";
// import { StrapiErrors } from "@/components/custom/StrapiErrors";

interface ProfileImageFormProps {
  id: string;
  url: string;
  alternativeText: string;
}

const initialState = {
  message: null,
  data: null,
  strapiErrors: null,
  zodErrors: null,
};

export default function ProfileImageForm({
  label,
  data,
  setData,
  className,
}: {
  label?: string,
  data?: any,
  setData?: any,
  className?: string,
}) {
  // const uploadProfileImageWithIdAction = uploadProfileImageAction.bind(
  //   null,
  //   data?.id
  // );

  // const [formState, formAction] = useFormState(
  //   uploadProfileImageWithIdAction,
  //   initialState
  // );

  return (
    <form className={twMerge("space-y-4", className)}>
      <div className="">
        <ImagePicker
          id="image"
          name="image"
          label={label || "label"}
          defaultValue={data?.url || ""}
          data={data}
          setData={setData}
        />
        {/* <ZodErrors error={formState.zodErrors?.image} />
        <StrapiErrors error={formState.strapiErrors} /> */}
      </div>
      <div className="flex justify-end">
        {/* <LoadingButton  loadingText="Saving Image">
          Save Image
        </LoadingButton> */}
        {/* <input type="submit" value="Save Image" className="w-full rounded-lg bg-primary p-2 text-white hover:bg-opacity-90 flex justify-center items-center" /> */}
      </div>
    </form>
  );
}