// app/[state]/page.tsx

import Link from 'next/link';

interface StatePageProps {
  params: { state: string };
}

const stateInfo: { [key: string]: { name: string; slogan: string } } = {
  "colorado": { name: "Colorado", slogan: "Colorful Colorado" },
  // Add more states here...
};

export default function StatePage({ params }: StatePageProps) {
  const stateData = stateInfo[params.state] || { name: params.state, slogan: "State slogan not available" };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{stateData.name}</h1>
      <p className="text-xl mb-4">{stateData.slogan}</p>
      <p>This is the detailed page for {stateData.name}. Add more information about the state here.</p>
      <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
        Back to Map
      </Link>
    </div>
  );
}