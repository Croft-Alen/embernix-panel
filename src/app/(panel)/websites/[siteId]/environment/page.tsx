import {
  Braces,
} from "lucide-react";

import {
  EnvironmentVariableTable,
} from "@/components/environment/environment-variable-table";

import {
  mockEnvironmentVariables,
} from "@/features/environment/mock-environment";

type EnvironmentPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function EnvironmentPage({
  params,
}: EnvironmentPageProps) {
  const {
    siteId,
  } =
    await params;

  const variables =
    mockEnvironmentVariables.filter(
      (
        variable
      ) =>
        variable.websiteId ===
        siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Braces className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Environment Variables
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Manage configuration and secrets used by your website.
        </p>
      </div>

      <EnvironmentVariableTable
        initialVariables={
          variables
        }
        websiteId={
          siteId
        }
      />
    </div>
  );
}