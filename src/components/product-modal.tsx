"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Modal from "@/components/modal";

/** Catalog overlay for an intercepted product URL; closing returns to the list. */
export default function ProductModal({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Modal
      open
      onClose={() => router.back()}
      title={title}
      panelClassName="max-w-5xl"
      closeLabel="Close product"
    >
      {children}
    </Modal>
  );
}
