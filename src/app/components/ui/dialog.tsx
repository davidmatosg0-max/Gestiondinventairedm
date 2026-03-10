import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

// Contexto para compartir el ID entre DialogContent y DialogDescription
const DialogDescriptionContext = React.createContext<{
  descriptionId: string;
  setDescriptionId: (id: string) => void;
}>({
  descriptionId: "",
  setDescriptionId: () => {},
});

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentProps<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const descriptionId = React.useId();
  
  // Check if children contains a DialogDescription using multiple detection methods
  const hasDescription = React.useMemo(() => {
    let found = false;
    const checkChildren = (children: React.ReactNode): void => {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          // Method 1: Check by type
          if (child.type === DialogDescription || 
              child.type === DialogPrimitive.Description) {
            found = true;
            return;
          }
          
          // Method 2: Check by displayName
          const displayName = (child.type as any)?.displayName;
          if (displayName === 'DialogDescription') {
            found = true;
            return;
          }
          
          // Method 3: Check by data-slot prop
          if (child.props?.['data-slot'] === 'dialog-description') {
            found = true;
            return;
          }
          
          // Method 4: Check if it's a Radix DialogPrimitive.Description by checking props
          const childType = child.type as any;
          if (childType?.render?.displayName === 'DialogPrimitive.Description' ||
              childType?.__docgenInfo?.displayName === 'DialogDescription') {
            found = true;
            return;
          }
          
          // Recursively check children
          if (child.props && child.props.children) {
            checkChildren(child.props.children);
          }
        }
      });
    };
    checkChildren(children);
    return found;
  }, [children]);

  // CRITICAL: Set aria-describedby BEFORE spreading props
  // This ensures our value takes precedence over Radix's default behavior
  const finalAriaDescribedBy = 'aria-describedby' in props 
    ? props['aria-describedby'] 
    : (hasDescription ? descriptionId : undefined);
  
  // Remove aria-describedby from props to avoid conflicts
  const { 'aria-describedby': _, ...restProps } = props;
  
  return (
    <DialogDescriptionContext.Provider value={{ descriptionId, setDescriptionId: () => {} }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          aria-describedby={finalAriaDescribedBy}
          {...restProps}
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200",
            !className?.includes("max-w-") && "max-w-[calc(100%-2rem)] sm:max-w-lg",
            className,
          )}
        >
          {children}
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogDescriptionContext.Provider>
  );
});

DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const { descriptionId } = React.useContext(DialogDescriptionContext);
  
  return (
    <DialogPrimitive.Description
      id={props.id || descriptionId}
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};