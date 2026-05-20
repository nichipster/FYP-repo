import type { Plan } from "../../utils/api";
import FreePlan from "../plans/freemium";
import ProPlan from "../plans/premium";
import PremiumPlan from "../plans/premium_annual";
import PlanCard from "../plans/temp";

interface Props {
  plans?: Plan[] | null;
}

export default function Fifth({ plans }: Props) {
  return (
    <div className="bg-green-50 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-500 text-lg">Start free, upgrade when you're ready</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-5xl mx-auto px-4">
        {plans && plans.length > 0 ? (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price_display}
              period={plan.period}
              highlight={plan.highlight}
              badge={plan.badge ?? undefined}
              features={plan.features.map((f) => ({ label: f.label, included: f.included }))}
            />
          ))
        ) : (
          <>
            <FreePlan />
            <ProPlan />
            <PremiumPlan />
          </>
        )}
      </div>
    </div>
  );
}
