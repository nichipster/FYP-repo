"""Seed all content tables from the original hardcoded frontend data.

Usage: python scripts/seed.py
Run after: alembic upgrade head
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select

from app.database import engine
from app.models.faq import faq_category, faq_item
from app.models.plan import plan_feature, subscription_plan
from app.models.sample_meal import sample_meal
from app.models.site_setting import site_setting
from app.models.team_member import team_member
from app.models.testimonial import testimonial


def seed():
    with Session(engine) as s:
        if s.exec(select(faq_category)).first():
            print("Database already seeded — skipping.")
            return

        # ── FAQs ────────────────────────────────────────────────────────────
        faq_data = [
            ("General", 0, [
                ("What is NutriTrack and how does it work?",
                 "NutriTrack is a Singapore-based nutrition tracking app that helps you log meals, track macros, and work towards your dietary goals. Simply create an account, complete a short health survey, and start logging your meals from our local food database."),
                ("Is NutriTrack free to use?",
                 "NutriTrack offers a free tier with core tracking features. A premium plan is available for advanced analytics, personalised meal recommendations, and more."),
                ("Is my health data stored securely?",
                 "Yes. All personal and health data is encrypted and stored securely. We do not sell your data to third parties."),
            ]),
            ("Diet & Health", 1, [
                ("Is NutriTrack suitable for people with dietary restrictions like halal or vegetarian?",
                 "Absolutely. NutriTrack supports halal, vegetarian, vegan, gluten-free, and several other dietary preferences. You can set your restrictions during onboarding and our food suggestions will reflect them."),
                ("How does NutriTrack calculate my daily calorie and nutrition targets?",
                 "We use your age, height, weight, gender, and activity level to calculate your Total Daily Energy Expenditure (TDEE), then adjust based on your goal — whether that's losing, maintaining, or gaining weight."),
                ("Can I use NutriTrack if I have a medical condition like diabetes or high cholesterol?",
                 "NutriTrack can support diabetes-friendly and heart-healthy goals with low GI and low sodium tracking. However, we always recommend consulting a healthcare professional for personalised medical advice."),
            ]),
            ("Food & Tracking", 2, [
                ("Can I track hawker centre and local restaurant meals?",
                 "Yes — this is one of NutriTrack's strengths. Our database includes a wide range of Singapore hawker dishes like chicken rice, laksa, nasi lemak, char kway teow, and more, with localised nutrition data."),
                ("How do I log a meal I can't find in the database?",
                 "You can manually enter nutrition details for any meal not in our database. We're constantly expanding our local food library based on user feedback."),
                ("How do I update my weight or health goals over time?",
                 "You can update your profile, weight, and goals at any time from the Edit Profile section in the app. Your calorie targets will automatically recalculate."),
            ]),
        ]

        for cat_name, cat_order, items in faq_data:
            cat = faq_category(name=cat_name, sort_order=cat_order)
            s.add(cat)
            s.flush()
            for i, (q, a) in enumerate(items):
                s.add(faq_item(category_id=cat.id, question=q, answer=a, sort_order=i))

        # ── Subscription Plans ────────────────────────────────────────────────
        free_features = [
            ("Basic meal logging up to 3 meals/day", True),
            ("Manual calorie and nutrition tracking", True),
            ("Daily calorie and nutrition summary", True),
            ("Food database search", True),
            ("Basic recipe search", True),
            ("Barcode scanning", True),
            ("Water intake tracking", True),
            ("Weight goal setting and tracking", True),
            ("Progress reports", True),
            ("Limited meal recommendations (2days/week)", True),
            ("General healthy eating tips", True),
            ("AI photo meal recognition", False),
            ("Unlimited meal recommendations", False),
            ("Meal plan with grocery lists", False),
            ("Advanced food filtering", False),
            ("Macro adjustments to the gram", False),
            ("Certified nutritionist tips", False),
            ("Save favourite meals", False),
        ]
        premium_features = [
            ("Everything in Freemium", True),
            ("AI photo meal recognition", True),
            ("Unlimited personalized meal recommendations", True),
            ("Meal plan creation with grocery lists", True),
            ("Advanced food filtering", True),
            ("Macro adjustments to the gram", True),
            ("Certified Nutritionist tips", True),
            ("Save favourite meals", True),
            ("Priority customer support", True),
            ("Book text-based consultations with professional Nutritionists", True),
            ("Cancel anytime", True),
        ]
        annual_features = [
            ("Everything in premium", True),
            ("Early access to new features", True),
            ("Cancel anytime", True),
        ]

        plans_data = [
            ("Free", "S$0", "forever", False, None, 0, free_features),
            ("Premium", "S$9.90", "per month", True, None, 1, premium_features),
            ("Premium Annual", "S$99.00", "per year", False, "Save 28%", 2, annual_features),
        ]

        for name, price, period, highlight, badge, order, features in plans_data:
            plan = subscription_plan(name=name, price_display=price, period=period, highlight=highlight, badge=badge, sort_order=order)
            s.add(plan)
            s.flush()
            for i, (label, included) in enumerate(features):
                s.add(plan_feature(plan_id=plan.id, label=label, included=included, sort_order=i))

        # ── Testimonials ──────────────────────────────────────────────────────
        testimonials_data = [
            ("Sarah L.", "Lost 12kg in 3 months", "NutriTrack completely changed how I approach food. The AI recommendations are spot on and the local food database actually has the foods I eat daily!", "SL"),
            ("Marcus T.", "Fitness Enthusiast", "Finally an app that understands local cuisine. The barcode scanning is lightning fast and the macro breakdowns are incredibly detailed.", "MT"),
            ("Priya K.", "Busy Professional", "I love how quick meal logging is. The photo recognition saves me so much time. Worth every cent of the Premium plan.", "PK"),
            ("James W.", "Marathon Runner", "The progress analytics helped me dial in my nutrition for race day. The certified nutritionist tips are genuinely useful, not just generic advice.", "JW"),
            ("Aisha M.", "Lost 8kg in 6 weeks", "The meal plans with grocery lists make my week so much easier. I never have to think about what to buy — NutriTrack does it for me.", "AM"),
        ]
        for i, (name, role, text, avatar) in enumerate(testimonials_data):
            s.add(testimonial(name=name, role=role, text=text, avatar=avatar, sort_order=i, active=True))

        # ── Team Members ──────────────────────────────────────────────────────
        team_data = [
            ("LN", "Let Yan Dong Nicholas", "TEAM LEADER / BACKEND DEVELOPER", "nydlet001@mymail.sim.edu.sg",
             "Oversees project direction, coordinates team efforts, and develops robust server infrastructure. Manages backend architecture and API development.", "bg-emerald-500"),
            ("HJ", "Hoo Jia Sheng", "FRONTEND DEVELOPER", "jshoo001@mymail.sim.edu.sg",
             "Develops mobile app UI components and implements user interface features with React and modern web technologies.", "bg-teal-500"),
            ("LB", "Lee Pui Kwan Benjamin", "FRONTEND DEVELOPER", "pkblee001@mymail.sim.edu.sg",
             "Designs and implements website framework, creates wireframes, and ensures optimal responsive design for web applications.", "bg-cyan-500"),
            ("LJ", "Lee Yeong Jeong", "BACKEND DEVELOPER", "lee11@mymail.sim.edu.sg",
             "Builds API endpoints, manages database operations, and implements server-side logic for the nutrition tracking system.", "bg-blue-500"),
            ("KT", "Kennedy Tan Jun Long", "DOCUMENTATION SPECIALIST", "kjtan010@mymail.sim.edu.sg",
             "Creates user guides, technical documentation, and ensures clear communication of project requirements and features.", "bg-indigo-500"),
            ("HJ", "Yap Hao Jiet", "DOCUMENTATION SPECIALIST", "hjyap001@mymail.sim.edu.sg",
             "Develops testing documentation, QA plans, and maintains comprehensive project documentation standards.", "bg-purple-500"),
        ]
        for i, (initials, name, role, email, desc, bg) in enumerate(team_data):
            s.add(team_member(initials=initials, name=name, role=role, email=email, description=desc, bg_color=bg, sort_order=i))

        # ── Sample Meals ──────────────────────────────────────────────────────
        meals_data = [
            ("Chicken Rice", "Hawker", 450, 32, 52, 10, "🍚", "Local Favourite", "bg-emerald-100 text-emerald-700"),
            ("Nasi Lemak", "Malay", 510, 18, 58, 24, "🌿", "Local Favourite", "bg-emerald-100 text-emerald-700"),
            ("Roti Prata", "Indian", 310, 9, 42, 13, "🫓", "Low Calorie", "bg-blue-100 text-blue-700"),
            ("Salmon Don", "Japanese", 520, 38, 55, 14, "🍣", "High Protein", "bg-orange-100 text-orange-700"),
        ]
        for i, (name, cuisine, cal, prot, carb, fat, emoji, tag, tag_color) in enumerate(meals_data):
            s.add(sample_meal(name=name, cuisine=cuisine, calories=cal, protein=prot, carbs=carb, fat=fat, emoji=emoji, tag=tag, tag_color=tag_color, sort_order=i))

        # ── Site Settings ─────────────────────────────────────────────────────
        settings_data = [
            ("apk_url", "https://expo.dev/artifacts/eas/pHjJCaG5uovo6BH3xe2DCk.apk", "APK download URL shown in the navbar Download button"),
            ("video_url", "https://res.cloudinary.com/dpodbd3rl/video/upload/v1779078246/IMG_9149_xol8hk.mp4", "Demo video URL shown on the homepage"),
        ]
        for key, value, desc in settings_data:
            s.add(site_setting(key=key, value=value, description=desc))

        s.commit()
        print("Seeded successfully.")


if __name__ == "__main__":
    seed()
