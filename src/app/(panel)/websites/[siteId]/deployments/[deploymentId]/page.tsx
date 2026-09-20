import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import Button from "@/components/ui/Button";

import {
  DeploymentDetails,
} from "@/components/deployments/deployment-details";

import {
  mockDeployments,
} from "@/features/deployments/mock-deployments";

type DeploymentPageProps = {
  params: Promise<{
    siteId: string;
    deploymentId: string;
  }>;
};

export default async function DeploymentPage({
  params,
}: DeploymentPageProps) {
  const {
    siteId,
    deploymentId,
  } = await params;

  const deployment =
    mockDeployments.find(
      (
        item
      ) =>
        item.id ===
          deploymentId &&
        item.websiteId ===
          siteId
    );

  if (!deployment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button
        href={`/websites/${siteId}/deployments`}
        variant="ghost"
        size="sm"
        icon={
          <ArrowLeft className="h-4 w-4" />
        }
      >
        Deployments
      </Button>

      <DeploymentDetails
        deployment={
          deployment
        }
        siteId={
          siteId
        }
      />
    </div>
  );
}