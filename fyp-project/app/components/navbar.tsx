import { NavLink } from "react-router";

const FALLBACK_APK_URL = "https://expo.dev/artifacts/eas/pHjJCaG5uovo6BH3xe2DCk.apk";

interface Props {
  downloadUrl?: string;
}

export default function Navbar({ downloadUrl }: Props) {
  const apkUrl = downloadUrl ?? FALLBACK_APK_URL;

  return (
    <header className="px-15">
      <div className="container flex items-center justify-between py-4 mx-auto">
        <NavLink to="/" className="flex-shrink-0">
          <span className="text-green-500 font-bold text-5xl">
            NutriTrack
          </span>
        </NavLink>

        <div className="flex items-center ml-auto">
          <nav className="flex items-center">
            <NavLink to="/" className="text-black hover:text-green-500 text-lg px-4 py-2">
              Home
            </NavLink>
            <NavLink to="/team" className="text-black hover:text-green-500 text-lg px-4 py-2">
              Team
            </NavLink>
            <a
              href={apkUrl}
              download
              className="text-white hover:text-black text-lg bg-green-500 border-2 border-green-500 rounded-lg px-4 py-2"
            >
              Download
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
