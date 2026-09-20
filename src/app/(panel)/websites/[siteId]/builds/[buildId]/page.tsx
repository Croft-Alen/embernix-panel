import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import Button from "@/components/ui/Button";

import {
  BuildDetails,
} from "@/components/builds/build-details";

import {
  mockBuilds,
} from "@/features/builds/mock-builds";

type BuildDetailsPageProps = {
  params: Promise<{
    siteId: string;
    buildId: string;
  }>;
};

export default async function BuildDetailsPage({
  params,
}: BuildDetailsPageProps) {
  const {
    siteId,
    buildId,
  } = await params;

  const build =
    mockBuilds.find(
      (item) =>
        item.id ===
          buildId &&
        item.websiteId ===
          siteId
    );

  if (!build) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button
        href={`/websites/${siteId}/builds`}
        variant="ghost"
        size="sm"
        icon={
          <ArrowLeft className="h-4 w-4" />
        }
      >
        Builds
      </Button>

      <BuildDetails
        build={
          build
        }
      />
    </div>
  );
}