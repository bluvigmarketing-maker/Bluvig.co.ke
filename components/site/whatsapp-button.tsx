"use client";

import { usePathname } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import { MessageCircle, X } from "lucide-react";

import { isChromeless } from "@/lib/chromeless";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track-client";
import { WhatsAppBrief } from "@/components/site/whatsapp-brief";

/**
 * Floating WhatsApp button. Opens a small composer so a visitor can describe
 * their project in one message from any page; "just chat" is one tap away.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (isChromeless(pathname)) return null;

  return (
    <Popover.Root onOpenChange={(open) => open && track("whatsapp_click")}>
      <Popover.Trigger
        aria-label="Message Bluvig on WhatsApp"
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-150 active:scale-95 data-[popup-open]:scale-95"
      >
        <MessageCircle className="size-7" fill="white" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" align="end" sideOffset={12} className="z-50">
          <Popover.Popup className="w-[min(22rem,calc(100vw-2.5rem))] origin-[var(--transform-origin)] rounded-2xl border border-navy-100 bg-white p-5 shadow-xl outline-none transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <Popover.Title className="font-heading text-lg font-semibold text-navy-950">
                  Tell us about your project
                </Popover.Title>
                <Popover.Description className="text-xs text-navy-600">
                  One message is enough to get started.
                </Popover.Description>
              </div>
              <Popover.Close
                aria-label="Close"
                className="rounded-md p-1 text-navy-500 hover:bg-navy-50 hover:text-navy-900"
              >
                <X className="size-4" aria-hidden="true" />
              </Popover.Close>
            </div>
            <WhatsAppBrief autoFocus />
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-xs font-semibold text-gold-700 underline-offset-4 hover:underline"
            >
              Or just open a chat
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
