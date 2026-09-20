import {
  Rocket,
} from "lucide-react";

import {
  DeploymentCard,
} from "@/components/deployments/deployment-card";

import {
  mockDeployments,
} from "@/features/deployments/mock-deployments";

type DeploymentsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function DeploymentsPage({
  params,
}: DeploymentsPageProps) {
  const {
    siteId,
  } = await params;

  const deployments =
    mockDeployments.filter(
      (
        deployment
      ) =>
        deployment.websiteId ===
        siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Deployments
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          View all deployments
          for this website.
        </p>
      </div>

      {deployments.length >
      0 ? (
        <div className="space-y-3">
          {deployments.map(
            (
              deployment
            ) => (
              <DeploymentCard
                key={
                  deployment.id
                }
                deployment={
                  deployment
                }
                siteId={
                  siteId
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <h2 className="text-sm font-semibold">
            No deployments yet
          </h2>

          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Deployments for
            this website will
            appear here.
          </p>
        </div>
      )}
    </div>
  );
}