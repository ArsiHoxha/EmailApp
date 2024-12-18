import React from 'react';

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-gray-900 shadow-xl ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <img
          alt=""
          src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg"
          className="mx-auto h-12"
        />
        <figure className="mt-10">
          <blockquote className="text-center text-xl font-semibold leading-8 sm:text-2xl sm:leading-9 relative">
            <p className="relative">
              <span className="absolute -left-5 -top-5 text-6xl text-indigo-500 leading-none select-none">“</span>
              This tool has completely transformed the way I manage my inbox! The AI-powered summaries save me hours every week, and the automatic categorization keeps everything organized without any effort. The AI reply feature is a game-changer – no more stressing over quick responses. If you're looking to streamline your email workflow, this app is a must-have!
              <span className="absolute -right-5 -bottom-5 text-6xl text-indigo-500 leading-none select-none">”</span>
            </p>
          </blockquote>
          <figcaption className="mt-10">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="mx-auto h-10 w-10 rounded-full"
            />
            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-black">Judith Black</div>
              <svg width={3} height={3} viewBox="0 0 2 2" aria-hidden="true" className="fill-gray-900">
                <circle r={1} cx={1} cy={1} />
              </svg>
              <div className="text-black">CEO of Workcation</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
