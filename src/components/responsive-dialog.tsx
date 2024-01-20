"use client";

import {
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

type StatefulContent = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => ReactNode | ReactNode[];

export const ResponsiveDialog = (props: {
  trigger: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode | ReactNode[] | StatefulContent;
  footer?: ReactNode;
  contentClassName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className={cn("max-w-md", props.contentClassName)}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {isFunctionType(props.children)
          ? props.children({ open, setOpen })
          : props.children}
      </DialogContent>
      {props.footer ? <DialogFooter>{props.footer}</DialogFooter> : null}
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{props.trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{props.title}</DrawerTitle>
          <DrawerDescription>{props.description}</DrawerDescription>
        </DrawerHeader>
        <div className={cn("px-4", props.contentClassName)}>
          {isFunctionType(props.children)
            ? props.children({ open, setOpen })
            : props.children}
        </div>
        <DrawerFooter className="pt-2">
          {props.footer ? (
            props.footer
          ) : (
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const isFunctionType = (
  prop: ReactNode | ReactNode[] | StatefulContent,
): prop is ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => ReactNode | ReactNode[] => {
  return typeof prop === "function";
};
