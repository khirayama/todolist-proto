import { ReactNode } from "react";
import qs from "query-string";

import Link from "next/link";

export function ParamsLink(props: {
  href: string;
  params?: Query;
  mergeParams?: boolean;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
}) {
  const q = props.mergeParams
    ? { ...qs.parse(window.location.search), ...props.params }
    : props.params;
  const href = `${props.href}?${qs.stringify(q)}`;
  return (
    <Link href={href} className={props.className} tabIndex={props.tabIndex}>
      {props.children}
    </Link>
  );
}
