'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChangingBackground from '@/components/Common/AnimatedBackground';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Affiliate",
    price: "Free",
    features: [
      "Access to basic tools",
      "Limited client management",
      "Standard support",
    ],
    colors: ["88, 202, 155", "72, 191, 227", "86, 182, 194"],
  },
  {
    name: "Basic",
    price: "$29.99/mo",
    features: [
      "Full suite of tools",
      "Advanced client management",
      "Priority support",
      "Performance analytics",
    ],
    colors: ["196, 26, 105", "231, 76, 60", "243, 156, 18"],
  },
  {
    name: "Premium",
    price: "$99.99/mo",
    features: [
      "All Basic features",
      "AI-powered insights",
      "Dedicated account manager",
      "Custom integrations",
      "Exclusive training sessions",
    ],
    colors: ["102, 65, 169", "54, 15, 120", "142, 68, 173"],
  },
];

const faqs = [
  {
    question: "What's included in the Affiliate plan?",
    answer: "The Affiliate plan is our free tier that gives you access to basic tools and limited client management features. It's perfect for those just starting out or exploring our platform.",
  },
  {
    question: "How does the Basic plan differ from the Affiliate plan?",
    answer: "The Basic plan offers a full suite of tools, advanced client management, priority support, and performance analytics. It's designed for growing insurance advisors who need more robust features.",
  },
  {
    question: "What makes the Premium plan worth it?",
    answer: "The Premium plan includes all Basic features plus AI-powered insights, a dedicated account manager, custom integrations, and exclusive training sessions. It's ideal for established advisors looking to maximize their potential.",
  },
  {
    question: "Can I switch between plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
];

const InsuranceSubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Eau Claire Partners Subscription Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Unlock your potential with our tailored subscription plans
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <ChangingBackground key={plan.name} className="rounded-lg shadow-lg overflow-hidden" colors={plan.colors}>
              <Card className="h-full bg-transparent flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-xl font-bold text-white">{plan.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-6 w-6 text-white" />
                          <span className="ml-3 text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="mt-auto">
                  <Button
                    className="w-full bg-white text-purple-700 hover:bg-gray-100"
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    Select {plan.name} Plan
                  </Button>
                </CardFooter>
              </Card>
            </ChangingBackground>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5"
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="p-2 rounded-lg bg-purple-600 shadow-lg sm:p-3">
                <div className="flex items-center justify-between flex-wrap">
                  <div className="w-0 flex-1 flex items-center">
                    <p className="ml-3 font-medium text-white truncate">
                      <span className="md:hidden">You've selected the {selectedPlan} plan!</span>
                      <span className="hidden md:inline">You've selected the {selectedPlan} plan. Complete your subscription now!</span>
                    </p>
                  </div>
                  <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                    <Button className="w-full bg-white text-purple-600 hover:bg-purple-50">
                      Complete Subscription
                    </Button>
                  </div>
                  <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                    <Button variant="ghost" onClick={() => setSelectedPlan('')} className="-mr-1 flex p-2 rounded-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-white">
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsuranceSubscriptionPlans;