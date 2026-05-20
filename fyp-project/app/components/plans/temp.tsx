import { NavLink } from "react-router";

type Feature = {
    label: string;
    included: boolean;
};

type PlanCardProps = {
    name: string;
    price: string;
    period: string;
    highlight?: boolean;
    badge?: string;
    features: Feature[];
};

export default function PlanCard({ name, price, period, highlight = false, badge, features }: PlanCardProps) {
    return (
        <div className={`flex flex-col rounded-2xl p-8 flex-1 shadow-md transition-transform hover:-translate-y-1 ${
            highlight
                ? "bg-green-500 text-white scale-105 shadow-xl"
                : "bg-white text-gray-900 border border-gray-200"
        }`}>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>
                        {name}
                    </h3>
                    {(highlight || badge) && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            highlight
                                ? "bg-white text-green-600"
                                : "bg-green-100 text-green-600"
                        }`}>
                            {highlight ? "Popular" : badge}
                        </span>
                    )}
                </div>
                <div className="flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-gray-900"}`}>
                        {price}
                    </span>
                    <span className={`text-sm mb-1 ${highlight ? "text-green-100" : "text-gray-400"}`}>
                        /{period}
                    </span>
                </div>
            </div>

            <ul className="flex flex-col gap-3 mb-8 h-96 overflow-y-auto pr-1">
                {features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3">
                        {feature.included ? (
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                highlight ? "bg-white" : "bg-green-100"
                            }`}>
                                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        ) : (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100">
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                        )}
                        <span className={`text-sm ${
                            feature.included
                                ? highlight ? "text-white" : "text-gray-700"
                                : highlight ? "text-green-200" : "text-gray-400"
                        }`}>
                            {feature.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}