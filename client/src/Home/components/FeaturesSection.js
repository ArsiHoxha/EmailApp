import React from 'react'

import { CloudArrowUpIcon, LockClosedIcon, ServerIcon,ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid'
import WorkspaceImage from './images/workspace.png';

const features = [
  {
    name: 'AI-Powered Summaries',
    description:
      'Instantly extract key information from long emails, saving you time and helping you focus on what matters most.',
    icon: CloudArrowUpIcon, // Icon representing automation or AI
  },
  {
    name: 'Seamless Categorization',
    description:
      'Automatically sort emails into lists based on categories like projects, priorities, or custom tags—keeping your inbox organized effortlessly.',
    icon: LockClosedIcon, // Icon representing structure or organization
  },
  {
    name: 'Advanced Filters & Search',
    description:
      'Quickly find the email you need with multi-layered filters, including date ranges, sentiment analysis, and attachment type.',
    icon: ServerIcon, // Icon related to search or filters
  },
  {
    name: 'AI-Powered Replies',
    description:
      'Generate context-aware email responses with one click, making communication faster and more efficient.',
    icon: ChatBubbleLeftRightIcon, // Icon representing messaging or communication
  },
];

export default function FeaturesSection() {
  return (
    <div className="overflow-hidden bg-gray-200 mt-10 sm:py-32 ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-black  sm:text-4xl">A better workflow</p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-black  lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-black ">
                      <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src={WorkspaceImage}
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  )
}
