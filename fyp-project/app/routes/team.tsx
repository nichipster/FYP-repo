import type { Route } from "./+types/team";
import TeamHeader from "../components/teamcards/teamheader";
import TeamMember from "../components/teamcards/teammember";
import { teamMembers as hardcodedTeamMembers } from "../components/teamcards/teamData";
import { publicFetch, type TeamMember as TeamMemberType } from "../utils/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Team - NutriTrack" },
    { name: "description", content: "Meet our team" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const members = await publicFetch<TeamMemberType[]>("/api/team", request);
  return { members };
}

export default function Team({ loaderData }: Route.ComponentProps) {
  const { members } = loaderData;
  const displayMembers = members ?? hardcodedTeamMembers;

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamHeader />

      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMembers.map((member, index) => (
              <TeamMember
                key={index}
                initials={member.initials}
                name={member.name}
                role={member.role}
                email={member.email}
                description={member.description}
                bgColor={"bg_color" in member ? (member as TeamMemberType).bg_color : (member as any).bgColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
