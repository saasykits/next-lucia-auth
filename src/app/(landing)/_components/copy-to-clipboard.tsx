"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CopyIcon  , CheckIcon} from "@radix-ui/react-icons";
import { useState } from "react";
import { toast } from "sonner";

export const CopyToClipboard = ({ text }: { text: string }) => {

  const [copied , setCopied] = useState(false)
  const copyToClipboard = async () => {
    setCopied(true)
    setTimeout(() => {
       setCopied(false)
    } , 2000)
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard", {
      icon: <CopyIcon className="h-4 w-4" />,
    });
  };
  return (
    <div className="flex justify-center gap-3">
      <Input
        readOnly
        value={text}
        className="bg-secondary text-muted-foreground"
      />
      <Button size="icon" onClick={() => copyToClipboard()}>
        {copied ? <CheckIcon className={cn( copied ? "opacity-100": "opacity-0" , "h-5 w-5 transition-opacity duration-500" )}/>: <CopyIcon className="h-5 w-5" />}
      </Button>
    </div>
  );
};
