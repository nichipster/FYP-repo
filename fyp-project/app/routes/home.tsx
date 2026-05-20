import type { Route } from "./+types/home";
import First from "../components/homecards/card1";
import Second from "../components/homecards/card2";
import Third from "../components/homecards/card3";
import Fourth from "../components/homecards/card4";
import Fifth from "../components/homecards/card5";
import Sixth from "../components/homecards/card6";
import Seventh from "../components/homecards/card7";
import Eighth from "../components/homecards/card8";
import { publicFetch, type FaqGroup, type Plan, type SampleMeal, type SiteSettings, type Testimonial } from "../utils/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NutriTrack" },
    { name: "description", content: "Your Personal Nutrition Guide" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const [faqs, plans, testimonials, meals, settings] = await Promise.all([
    publicFetch<FaqGroup[]>("/api/faqs", request),
    publicFetch<Plan[]>("/api/plans", request),
    publicFetch<Testimonial[]>("/api/testimonials", request),
    publicFetch<SampleMeal[]>("/api/meals", request),
    publicFetch<SiteSettings>("/api/settings", request),
  ]);
  return { faqs, plans, testimonials, meals, settings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { faqs, plans, testimonials, meals, settings } = loaderData;

  return (
    <div>
      <First />
      <Second />
      <Third />
      <Fourth meals={meals} />
      <Fifth plans={plans} />
      <Sixth videoUrl={settings?.video_url} />
      <Seventh testimonials={testimonials} />
      <Eighth faqs={faqs} />
    </div>
  );
}
