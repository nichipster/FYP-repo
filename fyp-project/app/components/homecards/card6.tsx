const FALLBACK_VIDEO_URL =
  "https://res.cloudinary.com/dpodbd3rl/video/upload/v1779078246/IMG_9149_xol8hk.mp4";

interface Props {
  videoUrl?: string | null;
}

export default function Sixth({ videoUrl }: Props) {
  const src = videoUrl ?? FALLBACK_VIDEO_URL;

  return (
    <div className="py-16 px-4 bg-gray-50 pt-50">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">See NutriTrack in Action</h2>
        <p className="text-gray-500 text-lg">Watch how easy it is to track your nutrition</p>
      </div>

      <div className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl">
        <video
          className="w-full h-auto"
          controls
          playsInline
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
