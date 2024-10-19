import { CheckIcon } from '@heroicons/react/20/solid'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51P5BIpHmq9JrEjv2LIo0DvKqjxQicz8pmODvxmHknvKFI8YVo9ZSVY6r7mBnMMGBnBGreMIQPeRdfwznLT2viZUC00PbAiv6Fc')

const tiers = [
  {
    name: 'Hobby',
    id: 'tier-hobby',
    priceId: 'price_1QAFPcHmq9JrEjv2ZKJJ3cvY', // Replace with your real Stripe Price ID
    priceMonthly: '$29',
    description: "The perfect plan if you're just getting started with our product.",
    features: ['25 products', 'Up to 10,000 subscribers', 'Advanced analytics', '24-hour support response time'],
    featured: false,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    priceId: 'price_1QAFM1Hmq9JrEjv2Xd36vFAm', // Replace with your real Stripe Price ID
    priceMonthly: '$99',
    description: 'Dedicated support and infrastructure for your company.',
    features: [
      'Unlimited products',
      'Unlimited subscribers',
      'Advanced analytics',
      'Dedicated support representative',
      'Marketing automations',
      'Custom integrations',
    ],
    featured: true,
  },
]

export default function PriceTable() {

const handleCheckout = async (priceId, type) => {
  const stripe = await stripePromise;

  console.log(type)
  try {
    const { data } = await axios.post('http://localhost:8080/create-checkout-session',{
      priceId,
      type, // Send the subscription type (monthly/yearly)
    },{withCredentials:true});

    // Redirect to Stripe checkout
    await stripe.redirectToCheckout({ sessionId: data.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    alert('Something went wrong. Please try again.');
  }
};

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          The right price for you, whoever you are
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-3xl p-8 ${tier.featured ? 'bg-gray-900 text-white' : 'bg-white'} ring-1 ring-gray-900/10 sm:p-10`}
          >
            <h3 className="text-base font-semibold leading-7">{tier.name}</h3>
            <p className="mt-4 text-5xl font-bold tracking-tight">{tier.priceMonthly} /month</p>
            <p className="mt-6 text-base leading-7">{tier.description}</p>
            <ul className="mt-8 space-y-3 text-sm leading-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-5 text-indigo-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(tier.priceId,tier.priceMonthly)}
              className={`mt-8 block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ${
                tier.featured ? 'bg-indigo-500 text-white' : 'text-indigo-600 ring-1 ring-inset ring-indigo-200'
              }`}
            >
              Get started today
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
