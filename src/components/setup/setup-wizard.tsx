"use client";

import {
  ArrowLeft,
  ArrowRight,
  Rocket,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  DeployStep,
} from "@/components/setup/deploy-step";

import {
  DetectStep,
} from "@/components/setup/detect-step";

import {
  ReviewStep,
} from "@/components/setup/review-step";

import {
  SetupSteps,
} from "@/components/setup/setup-steps";

import {
  SourceStep,
} from "@/components/setup/source-step";

import {
  UploadStep,
} from "@/components/setup/upload-step";

import {
  saveBuildSettingsAction,
  saveSetupProgressAction,
} from "@/app/(panel)/websites/[siteId]/setup/actions";

import {
  getMockDetectedProject,
} from "@/features/setup/mock-setup";

import type {
  DeploymentStage,
  DetectedProject,
  SetupSource,
  SetupStep,
  WebsiteSetupProgress,
} from "@/features/setup/types";

type SetupWizardProps = {
  websiteId:
    string;

  websiteName:
    string;

  defaultHostname:
    string;

  initialSetup:
    WebsiteSetupProgress;
};

const steps:
  SetupStep[] = [
    "source",
    "upload",
    "detect",
    "review",
    "deploy",
  ];

export function SetupWizard({
  websiteId,
  websiteName,
  defaultHostname,
  initialSetup,
}: SetupWizardProps) {
  const [
    currentStep,
    setCurrentStep,
  ] =
    useState<SetupStep>(
      initialSetup.status ===
        "completed"
        ? "deploy"
        : initialSetup.currentStep
    );

  const [
    source,
    setSource,
  ] =
    useState<
      SetupSource | undefined
    >(
      initialSetup.source
    );

  const [
    uploadedFileName,
    setUploadedFileName,
  ] =
    useState<
      string | undefined
    >(
      initialSetup.uploadedFileName
    );

  const [
    repositoryUrl,
    setRepositoryUrl,
  ] =
    useState(
      initialSetup.repositoryUrl ??
        ""
    );

  const [
    detectedProject,
    setDetectedProject,
  ] =
    useState<
      DetectedProject | undefined
    >(
      initialSetup.detectedProject
    );

  const [
    deploymentStage,
    setDeploymentStage,
  ] =
    useState<DeploymentStage>(
      initialSetup.status ===
        "completed"
        ? "ready"
        : "idle"
    );

  const [
    savingSettings,
    setSavingSettings,
  ] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] =
    useState<
      string | null
    >(null);

  const saveTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | undefined
    >(undefined);

  const initialRenderRef =
    useRef(
      true
    );

  useEffect(() => {
    if (
      initialRenderRef.current
    ) {
      initialRenderRef.current =
        false;

      return;
    }

    if (
      deploymentStage ===
      "ready"
    ) {
      return;
    }

    if (
      saveTimer.current
    ) {
      clearTimeout(
        saveTimer.current
      );
    }

    saveTimer.current =
      setTimeout(
        () => {
          void saveProgress();
        },
        500
      );

    return () => {
      if (
        saveTimer.current
      ) {
        clearTimeout(
          saveTimer.current
        );
      }
    };
  }, [
    websiteId,
    currentStep,
    source,
    uploadedFileName,
    repositoryUrl,
    detectedProject,
    deploymentStage,
  ]);

  async function saveProgress() {
    try {
      setSaveError(
        null
      );

      await saveSetupProgressAction({
        websiteId,

        currentStep,

        source,

        uploadedFileName,

        repositoryUrl:
          repositoryUrl.trim()
            ? repositoryUrl.trim()
            : undefined,

        detectedProject,
      });
    } catch (
      error
    ) {
      setSaveError(
        error instanceof
          Error
          ? error.message
          : "Failed to save setup progress."
      );
    }
  }

  const currentIndex =
    steps.indexOf(
      currentStep
    );

  const handleDetectionReady =
    useCallback(
      () => {},
      []
    );

  async function next() {
    if (
      currentStep ===
      "source"
    ) {
      if (
        !source
      ) {
        return;
      }

      setCurrentStep(
        "upload"
      );

      return;
    }

    if (
      currentStep ===
      "upload"
    ) {
      const valid =
        source ===
        "upload"
          ? Boolean(
              uploadedFileName
            )
          : Boolean(
              repositoryUrl.trim()
            );

      if (
        !valid
      ) {
        return;
      }

      const project =
        getMockDetectedProject(
          uploadedFileName,
          repositoryUrl
        );

      setDetectedProject(
        project
      );

      setCurrentStep(
        "detect"
      );

      return;
    }

    if (
      currentStep ===
      "detect"
    ) {
      if (
        !detectedProject
      ) {
        return;
      }

      setCurrentStep(
        "review"
      );

      return;
    }

    if (
      currentStep ===
        "review" &&
      detectedProject
    ) {
      if (
        savingSettings
      ) {
        return;
      }

      setSavingSettings(
        true
      );

      setSaveError(
        null
      );

      try {
        await saveBuildSettingsAction({
          websiteId,

          framework:
            detectedProject.framework,

          installCommand:
            detectedProject.installCommand,

          buildCommand:
            detectedProject.buildCommand,

          outputDirectory:
            detectedProject.outputDirectory,
        });

        setCurrentStep(
          "deploy"
        );
      } catch (
        error
      ) {
        setSaveError(
          error instanceof
            Error
            ? error.message
            : "Failed to save build settings."
        );
      } finally {
        setSavingSettings(
          false
        );
      }
    }
  }

  function back() {
    if (
      currentIndex <=
        0 ||
      deploymentStage !==
        "idle" ||
      savingSettings
    ) {
      return;
    }

    setCurrentStep(
      steps[
        currentIndex -
          1
      ]
    );
  }

  async function deploy() {
    setDeploymentStage(
      "preparing"
    );

    await wait(
      800
    );

    setDeploymentStage(
      "building"
    );

    await wait(
      1200
    );

    setDeploymentStage(
      "deploying"
    );

    await wait(
      1000
    );

    setDeploymentStage(
      "ready"
    );
  }

  const canContinue =
    currentStep ===
    "source"
      ? Boolean(
          source
        )
      : currentStep ===
          "upload"
        ? source ===
          "upload"
          ? Boolean(
              uploadedFileName
            )
          : Boolean(
              repositoryUrl.trim()
            )
        : currentStep ===
            "detect"
          ? Boolean(
              detectedProject
            )
          : currentStep ===
              "review"
            ? Boolean(
                detectedProject
              )
            : true;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {saveError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      <SetupSteps
        currentStep={
          currentStep
        }
      />

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="min-h-[420px] p-6 sm:p-8">
          {currentStep ===
            "source" && (
            <SourceStep
              value={
                source
              }
              onChange={
                setSource
              }
            />
          )}

          {currentStep ===
            "upload" &&
            source && (
              <UploadStep
                source={
                  source
                }
                uploadedFileName={
                  uploadedFileName
                }
                repositoryUrl={
                  repositoryUrl
                }
                onFileChange={
                  setUploadedFileName
                }
                onRepositoryChange={
                  setRepositoryUrl
                }
              />
            )}

          {currentStep ===
            "detect" &&
            detectedProject && (
              <DetectStep
                detectedProject={
                  detectedProject
                }
                onProjectChange={
                  setDetectedProject
                }
                onReady={
                  handleDetectionReady
                }
              />
            )}

          {currentStep ===
            "review" &&
            detectedProject && (
              <ReviewStep
                project={
                  detectedProject
                }
              />
            )}

          {currentStep ===
            "deploy" && (
              <DeployStep
                stage={
                  deploymentStage
                }
                websiteName={
                  websiteName
                }
              />
            )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            icon={
              <ArrowLeft className="h-4 w-4" />
            }
            disabled={
              currentIndex ===
                0 ||
              deploymentStage !==
                "idle" ||
              savingSettings
            }
            onClick={
              back
            }
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep !==
              "deploy" && (
              <Button
                icon={
                  <ArrowRight className="h-4 w-4" />
                }
                disabled={
                  !canContinue ||
                  savingSettings
                }
                loading={
                  savingSettings
                }
                onClick={() => {
                  void next();
                }}
              >
                Continue
              </Button>
            )}

            {currentStep ===
              "deploy" &&
              deploymentStage ===
                "idle" && (
                <Button
                  icon={
                    <Rocket className="h-4 w-4" />
                  }
                  onClick={() => {
                    void deploy();
                  }}
                >
                  Deploy Website
                </Button>
              )}

            {currentStep ===
              "deploy" &&
              deploymentStage ===
                "ready" && (
                <Button
                  href={`/websites/${websiteId}`}
                >
                  Go to Overview
                </Button>
              )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        {defaultHostname}
      </p>
    </div>
  );
}

function wait(
  milliseconds:
    number
) {
  return new Promise<void>(
    (
      resolve
    ) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}