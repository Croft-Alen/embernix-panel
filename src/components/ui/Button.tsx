import Link from "next/link";

import {
  Loader2,
} from "lucide-react";

import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

type ButtonSize =
  | "sm"
  | "md";

type CommonProps = {
  children:
    ReactNode;

  variant?:
    ButtonVariant;

  size?:
    ButtonSize;

  icon?:
    ReactNode;

  loading?:
    boolean;

  className?:
    string;

  fullWidth?:
    boolean;
};

type ButtonElementProps =
  CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?:
      never;
  };

type LinkElementProps =
  CommonProps & {
    href:
      string;

    external?:
      boolean;

    target?:
      string;

    rel?:
      string;
  };

type ButtonProps =
  | ButtonElementProps
  | LinkElementProps;

export default function Button(
  props:
    ButtonProps
) {
  const {
    children,
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    className = "",
    fullWidth = false,
  } =
    props;

  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-semibold",
    "outline-none",
    "select-none",
    "transition-none",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    fullWidth
      ? "w-full"
      : "",
  ]
    .filter(
      Boolean
    )
    .join(
      " "
    );

  const sizeClasses =
    size ===
    "sm"
      ? "h-8 rounded-[7px] px-3 text-xs gap-1.5"
      : "h-10 rounded-[7px] px-4 text-sm gap-2";

  const variantClasses =
    variant ===
    "primary"
      ? [
          "border",
          "border-[var(--primary)]",
          "bg-[var(--primary)]",
          "text-[var(--primary-foreground)]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]",
        ].join(
          " "
        )
      : variant ===
          "secondary"
        ? [
            "border",
            "border-[var(--border-strong)]",
            "bg-[var(--surface-strong)]",
            "text-[var(--foreground)]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
          ].join(
            " "
          )
        : variant ===
            "danger"
          ? [
              "border",
              "border-red-500/30",
              "bg-red-500/10",
              "text-red-400",
            ].join(
              " "
            )
          : [
              "border",
              "border-transparent",
              "bg-transparent",
              "text-[var(--muted-foreground)]",
            ].join(
              " "
            );

  const classes = [
    baseClasses,
    sizeClasses,
    variantClasses,
    className,
  ]
    .filter(
      Boolean
    )
    .join(
      " "
    );

  const content =
    loading
      ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        )
      : (
          <>
            {icon && (
              <span className="flex shrink-0 items-center justify-center">
                {icon}
              </span>
            )}

            <span className="whitespace-nowrap">
              {children}
            </span>
          </>
        );

  if (
    "href" in
      props &&
    props.href
  ) {
    const {
      href,
      external = false,
      target,
      rel,
    } =
      props;

    if (
      external
    ) {
      return (
        <a
          href={
            href
          }
          target={
            target ??
            "_blank"
          }
          rel={
            rel ??
            "noreferrer"
          }
          className={
            classes
          }
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={
          href
        }
        className={
          classes
        }
      >
        {content}
      </Link>
    );
  }

  const {
    children:
      _children,
    variant:
      _variant,
    size:
      _size,
    icon:
      _icon,
    loading:
      _loading,
    className:
      _className,
    fullWidth:
      _fullWidth,
    href:
      _href,
    type = "button",
    disabled,
    ...nativeButtonProps
  } =
    props as
      ButtonElementProps;

  return (
    <button
      {...nativeButtonProps}
      type={
        type
      }
      disabled={
        disabled ||
        loading
      }
      className={
        classes
      }
    >
      {content}
    </button>
  );
}