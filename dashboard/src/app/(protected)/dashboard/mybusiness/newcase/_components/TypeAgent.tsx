'use client'
import React, { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getAdvisorNameList } from '../_actions/retrievedata';
import { twMerge } from 'tailwind-merge';
import { MdAddCircle } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { accessWithAuth } from '@/lib/isAuth';

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

const TypeAgent = ({ form, currentStep, setCurrentStep, markComplete, setSelectedSteps, isEditable, columnMode = true }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, setSelectedSteps: any, isEditable?: boolean, columnMode?: boolean }) => {
  const [advisorList, setAdvisorList] = React.useState([]);
  const [is100Percentage, setIs100Percentage] = React.useState(false);
  const [yourProfileId, setYourProfileId] = React.useState(0);
  const completionRef = useRef(false);
  const loadSplitAgent = useRef(false);
  const { control, setValue, watch, formState: { errors } } = form;
  const splitAgents = watch('splitAgents[]');
  const formData = watch();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'splitAgents'
  });
  const [type, setType] = React.useState('');

  useEffect(() => {
    const fetchAdvisorList = async () => {
      const response = await getAdvisorNameList();
      setAdvisorList(response);
    }
    const fetchWritingAgentId = async () => {
      const response = await accessWithAuth();
      setValue('writingAgentId', response.user.data.profile.id);
      setYourProfileId(response.user.data.profile.id);
    }
    fetchAdvisorList();
    fetchWritingAgentId();
  }, []);

  useEffect(() => {
    let totalPercentage = 0;
    splitAgents?.forEach((agent: any, index: number) => {
      if (agent?.referralCode && agent?.referralCode.length == 7 && agent.profileId == undefined) {
        const foundAdvisor:any = advisorList.find((advisor: any) => advisor.referralCode == agent.referralCode);
        if (foundAdvisor) {
          setValue(`splitAgents[${index}].profileId`, foundAdvisor.id);
          setValue(`splitAgents[${index}].found`, 'Found');
        }
      } else if (agent.name != undefined) {
        setValue(`splitAgents[${index}].profileId`, undefined);
        setValue(`splitAgents[${index}].name`, undefined);
      }
      totalPercentage += Number(agent.splitingPercentage);
    });

    if (totalPercentage == 100 && !completionRef.current) {
      markComplete(currentStep, true);
      completionRef.current = true;
      setIs100Percentage(true);
    } else if (totalPercentage != 100 && completionRef.current) {
      completionRef.current = false;
      markComplete(currentStep, false);
    }

    if (!loadSplitAgent.current && formData?.loadSplitAgents?.length > 0) {
      formData.loadSplitAgents.forEach((agent: any) => {
        const found = fields.find((field: any) => field.profileId == agent.profileId);
        if (!found) {
          append(agent);
        }
      });
      loadSplitAgent.current = true;
    }
  }, [formData, splitAgents, advisorList, fields, append, setValue, markComplete, currentStep]);

  const handleCaseType = (type: string) => {
    setType(type);
    setValue('caseType', type);
    if (type == "Affiliate") {
      setSelectedSteps([true, false, true, true, true]);
    }
  }

  const handleSplitAgentChoice = (choice: boolean) => {
    setValue('isSplitAgent', choice);
    if (!choice) {
      setValue('splitAgents', []);
      setValue('writingAgentId', yourProfileId);
      markComplete(currentStep, true);
    } else {
      markComplete(currentStep, false);
    }
  }

  return (
    <Form {...form}>
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Step 1: Product Type */}
            <div>
              <TypewriterEffectSmooth words='1. Please select the product type:' className='text-lg mb-4' />
              <div className='flex flex-row justify-center items-center space-x-8'>
                {['Insurance', 'Investment'].map((product) => (
                  <motion.div
                    key={product}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0, duration: 0.5 }}
                    className={twMerge(`flex flex-col justify-center items-center cursor-pointer`, (formData.caseType == product || formData.caseType == undefined) ? 'flex' : 'hidden')}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleCaseType(product)}
                  >
                    <Image src={`/images/icon/${product.toLowerCase()}.webp`} alt='Agent' width={60} height={60} />
                    <p className='font-semibold'>{product}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Step 2: Split Revenue */}
            {formData?.caseType && formData.caseType !== '' && (
              <div>
                <TypewriterEffectSmooth words='2. Need split revenue?' className='text-lg mb-4' />
                <div className='flex flex-row justify-start items-center space-x-8'>
                  <Button
                    type="button"
                    onClick={() => handleSplitAgentChoice(true)}
                    variant={formData.isSplitAgent ? "default" : "outline"}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSplitAgentChoice(false)}
                    variant={formData.isSplitAgent === false ? "default" : "outline"}
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Split Agents */}
            {formData?.caseType && formData?.isSplitAgent && (
              <div>
                <TypewriterEffectSmooth words='3. Click Add button' className='text-lg mb-4' />
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-row items-end space-x-4 bg-secondary/20 p-4 rounded-md">
                      <FormField
                        control={control}
                        name={`splitAgents[${index}].referralCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{index == 0 ? "Writing Agent" : "Split Agent"}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder='EXXXXXX' maxLength={7} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`splitAgents[${index}].found`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} disabled className='w-[5rem] border-none bg-transparent text-success' />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {`splitAgents[${index}].referralCode` && `splitAgents[${index}].profileId` && (
                        <FormField
                          control={control}
                          name={`splitAgents[${index}].splitingPercentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Split %</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" className='w-[5rem]' />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => remove(index)}
                        className='text-destructive'
                      >
                        <IoCloseCircle className="h-8 w-8" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => append({ agent: '', percentage: 0 })}
                  className='text-primary mt-4'
                >
                  <MdAddCircle className="h-8 w-8 mr-2" />
                  Add Split Agent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Form>
  );
};

export default TypeAgent;