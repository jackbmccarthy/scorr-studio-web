import { Metadata } from "next";
import CompetitionClient from "./CompetitionClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Metadata is generated client-side for now since we don't have SSR with Convex
  return {
    title: "Competition | Scorr Studio",
    description: `Register for competition`,
    openGraph: {
      title: "Competition",
      description: "Register for competition",
    },
  };
}

export default async function CompetitionPage({ params }: PageProps) {
  const { slug } = await params;
  
  return <CompetitionClient slug={slug} />;
}
